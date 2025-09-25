import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS and logging middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket setup
const BUCKET_NAME = 'make-95bd8cbb-videos';

async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log('Creating videos bucket...');
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, { 
      public: false,
      fileSizeLimit: 1073741824 // 1GB
    });
    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Videos bucket created successfully');
    }
  }
}

// Initialize storage on startup
ensureBucketExists();

// Authentication middleware
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No access token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user?.id) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
}

// Routes

// Sign up endpoint
app.post('/make-server-95bd8cbb/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0] },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name,
      plan: 'free',
      created_at: new Date().toISOString(),
      video_edits_used: 0,
      subscription_status: 'active'
    });

    return c.json({ 
      user: data.user,
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('Signup processing error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get user profile
app.get('/make-server-95bd8cbb/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      // Create profile if it doesn't exist
      const userEmail = c.get('userEmail');
      const newProfile = {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
        plan: 'free',
        created_at: new Date().toISOString(),
        video_edits_used: 0,
        subscription_status: 'active'
      };
      await kv.set(`user:${userId}`, newProfile);
      return c.json({ profile: newProfile });
    }
    
    return c.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user subscription
app.post('/make-server-95bd8cbb/upgrade', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { plan } = await c.req.json();
    
    if (!['free', 'pro'].includes(plan)) {
      return c.json({ error: 'Invalid plan type' }, 400);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const updatedProfile = {
      ...profile,
      plan,
      upgraded_at: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);

    // Add billing record for pro upgrade
    if (plan === 'pro') {
      const billingRecord = {
        user_id: userId,
        amount: 29.00,
        plan: 'pro',
        status: 'paid',
        date: new Date().toISOString()
      };
      await kv.set(`billing:${userId}:${Date.now()}`, billingRecord);
    }

    return c.json({ 
      profile: updatedProfile,
      message: `Successfully upgraded to ${plan} plan` 
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    return c.json({ error: 'Failed to upgrade subscription' }, 500);
  }
});

// Get billing history
app.get('/make-server-95bd8cbb/billing', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const billingRecords = await kv.getByPrefix(`billing:${userId}:`);
    
    // Sort by date (newest first)
    const sortedRecords = billingRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return c.json({ billing_history: sortedRecords });
  } catch (error) {
    console.error('Billing history error:', error);
    return c.json({ error: 'Failed to fetch billing history' }, 500);
  }
});

// Upload video endpoint
app.post('/make-server-95bd8cbb/upload', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check usage limits for free users
    if (profile.plan === 'free' && profile.video_edits_used >= 5) {
      return c.json({ 
        error: 'Free plan limit reached. Upgrade to Pro for unlimited edits.',
        limit_reached: true 
      }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get('video') as File;
    
    if (!file) {
      return c.json({ error: 'No video file provided' }, 400);
    }

    // Check file size limits
    const maxSize = profile.plan === 'pro' ? 1024 * 1024 * 1024 : 100 * 1024 * 1024; // 1GB pro, 100MB free
    if (file.size > maxSize) {
      return c.json({ 
        error: `File too large. ${profile.plan === 'pro' ? '1GB' : '100MB'} limit for ${profile.plan} plan.` 
      }, 413);
    }

    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload video' }, 500);
    }

    // Create video record
    const videoId = `video_${Date.now()}`;
    const videoRecord = {
      id: videoId,
      user_id: userId,
      file_name: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      status: 'uploaded',
      created_at: new Date().toISOString(),
      processing_progress: 0
    };

    await kv.set(`video:${videoId}`, videoRecord);
    await kv.set(`user_video:${userId}:${videoId}`, videoId);

    return c.json({ 
      video_id: videoId,
      message: 'Video uploaded successfully',
      video: videoRecord
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    return c.json({ error: 'Failed to process upload' }, 500);
  }
});

// Start video processing
app.post('/make-server-95bd8cbb/process/:videoId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const videoId = c.req.param('videoId');
    
    const videoRecord = await kv.get(`video:${videoId}`);
    if (!videoRecord || videoRecord.user_id !== userId) {
      return c.json({ error: 'Video not found' }, 404);
    }

    if (videoRecord.status !== 'uploaded') {
      return c.json({ error: 'Video cannot be processed in current state' }, 400);
    }

    // Update video status
    const updatedVideo = {
      ...videoRecord,
      status: 'processing',
      processing_started_at: new Date().toISOString(),
      processing_progress: 0
    };

    await kv.set(`video:${videoId}`, updatedVideo);

    // Update user edit count
    const profile = await kv.get(`user:${userId}`);
    if (profile) {
      await kv.set(`user:${userId}`, {
        ...profile,
        video_edits_used: (profile.video_edits_used || 0) + 1
      });
    }

    // Simulate processing (in real app, this would trigger actual AI processing)
    setTimeout(async () => {
      try {
        const processedVideo = {
          ...updatedVideo,
          status: 'completed',
          processing_progress: 100,
          processing_completed_at: new Date().toISOString(),
          processed_file_path: `processed/${updatedVideo.file_path}`
        };
        await kv.set(`video:${videoId}`, processedVideo);
      } catch (error) {
        console.error('Processing completion error:', error);
      }
    }, 10000); // Complete after 10 seconds

    return c.json({ 
      message: 'Processing started',
      video: updatedVideo
    });

  } catch (error) {
    console.error('Processing start error:', error);
    return c.json({ error: 'Failed to start processing' }, 500);
  }
});

// Get video status
app.get('/make-server-95bd8cbb/video/:videoId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const videoId = c.req.param('videoId');
    
    const videoRecord = await kv.get(`video:${videoId}`);
    if (!videoRecord || videoRecord.user_id !== userId) {
      return c.json({ error: 'Video not found' }, 404);
    }

    // Simulate processing progress updates
    if (videoRecord.status === 'processing') {
      const now = new Date().getTime();
      const startTime = new Date(videoRecord.processing_started_at).getTime();
      const elapsed = now - startTime;
      const progress = Math.min(Math.floor((elapsed / 10000) * 100), 100);
      
      const updatedVideo = {
        ...videoRecord,
        processing_progress: progress
      };
      
      if (progress < 100) {
        await kv.set(`video:${videoId}`, updatedVideo);
        return c.json({ video: updatedVideo });
      }
    }

    return c.json({ video: videoRecord });

  } catch (error) {
    console.error('Video status error:', error);
    return c.json({ error: 'Failed to get video status' }, 500);
  }
});

// Get download URL for processed video
app.get('/make-server-95bd8cbb/download/:videoId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const videoId = c.req.param('videoId');
    
    const videoRecord = await kv.get(`video:${videoId}`);
    if (!videoRecord || videoRecord.user_id !== userId) {
      return c.json({ error: 'Video not found' }, 404);
    }

    if (videoRecord.status !== 'completed') {
      return c.json({ error: 'Video processing not completed' }, 400);
    }

    // Create signed URL for download
    const filePath = videoRecord.processed_file_path || videoRecord.file_path;
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return c.json({ error: 'Failed to generate download URL' }, 500);
    }

    return c.json({ 
      download_url: signedUrlData.signedUrl,
      expires_at: new Date(Date.now() + 3600000).toISOString()
    });

  } catch (error) {
    console.error('Download URL error:', error);
    return c.json({ error: 'Failed to get download URL' }, 500);
  }
});

// Get user's videos
app.get('/make-server-95bd8cbb/videos', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userVideos = await kv.getByPrefix(`user_video:${userId}:`);
    
    const videoDetails = await Promise.all(
      userVideos.map(async (videoId) => {
        return await kv.get(`video:${videoId}`);
      })
    );

    // Sort by creation date (newest first)
    const sortedVideos = videoDetails
      .filter(video => video !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ videos: sortedVideos });

  } catch (error) {
    console.error('Videos fetch error:', error);
    return c.json({ error: 'Failed to fetch videos' }, 500);
  }
});

// Health check
app.get('/make-server-95bd8cbb/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'CutCraft AI API'
  });
});

// Start server
Deno.serve(app.fetch);