import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Zap, Upload, Download, Settings, LogOut, Play, Crown, AlertCircle } from 'lucide-react';
import { videoApi } from '../utils/supabase/client';
import type { Page } from '../App';

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  video_edits_used: number;
  subscription_status: string;
}

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  user: User | null;
  onUserUpdate: () => Promise<void>;
}

interface Video {
  id: string;
  file_name: string;
  file_size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  processing_progress: number;
  created_at: string;
}

export function Dashboard({ onNavigate, onLogout, user, onUserUpdate }: DashboardProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);

  // Poll for video status updates
  useEffect(() => {
    if (currentVideo && currentVideo.status === 'processing') {
      const interval = setInterval(async () => {
        try {
          const { video } = await videoApi.getVideoStatus(currentVideo.id);
          setCurrentVideo(video);
          
          if (video.status === 'completed' || video.status === 'error') {
            clearInterval(interval);
            await onUserUpdate(); // Refresh user data
            loadUserVideos(); // Refresh video list
          }
        } catch (error) {
          console.error('Status polling error:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentVideo?.id, currentVideo?.status]);

  // Load user videos on mount
  useEffect(() => {
    if (user) {
      loadUserVideos();
    }
  }, [user]);

  const loadUserVideos = async () => {
    try {
      const { videos } = await videoApi.getUserVideos();
      setUserVideos(videos);
    } catch (error) {
      console.error('Failed to load user videos:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setCurrentVideo(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      setCurrentVideo(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await videoApi.uploadVideo(uploadedFile);
      setCurrentVideo(result.video);
      setUploadedFile(null);
      await onUserUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to upload video. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartProcessing = async () => {
    if (!currentVideo) return;

    try {
      await videoApi.startProcessing(currentVideo.id);
      const { video } = await videoApi.getVideoStatus(currentVideo.id);
      setCurrentVideo(video);
    } catch (error) {
      console.error('Processing error:', error);
      setError('Failed to start processing. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!currentVideo) return;

    try {
      const { download_url } = await videoApi.getDownloadUrl(currentVideo.id);
      window.open(download_url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to generate download link. Please try again.');
    }
  };

  const canUpload = user?.plan === 'pro' || (user?.video_edits_used || 0) < 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">CutCraft AI</span>
            </div>
            <span className="text-lg">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={user?.plan === 'pro' ? 'default' : 'secondary'} className="gap-1">
              {user?.plan === 'pro' && <Crown className="w-3 h-3" />}
              {user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('settings')}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Your Video</CardTitle>
            <CardDescription>
              Drop your video file here or click to browse
              {user?.plan === 'free' && (
                <span className="block mt-1 text-sm">
                  Free plan: {5 - (user?.video_edits_used || 0)} edits remaining
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!canUpload && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Free plan limit reached. Upgrade to Pro for unlimited edits.
                </AlertDescription>
              </Alert>
            )}

            {!uploadedFile && !currentVideo ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  canUpload 
                    ? 'border-muted-foreground/25 hover:border-primary/50' 
                    : 'border-muted-foreground/10 cursor-not-allowed opacity-50'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => canUpload && document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg mb-2">Drag & drop your video here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports MP4, MOV, AVI files up to {user?.plan === 'pro' ? '1GB' : '100MB'}
                </p>
                {canUpload && <Button>Browse Files</Button>}
                <input
                  id="file-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={!canUpload}
                />
              </div>
            ) : uploadedFile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    disabled={isUploading}
                  >
                    Remove
                  </Button>
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  className="w-full"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </Button>
              </div>
            ) : currentVideo && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{currentVideo.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(currentVideo.file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Badge variant={
                      currentVideo.status === 'completed' ? 'default' :
                      currentVideo.status === 'processing' ? 'secondary' :
                      currentVideo.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {currentVideo.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentVideo(null)}
                  >
                    Clear
                  </Button>
                </div>
                
                {currentVideo.status === 'uploaded' && (
                  <Button onClick={handleStartProcessing} className="w-full">
                    Start AI Processing
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Progress */}
        {currentVideo && (currentVideo.status === 'processing' || currentVideo.status === 'completed') && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {currentVideo.status === 'processing' ? 'Processing Your Video...' : 'Processing Complete!'}
              </CardTitle>
              <CardDescription>
                {currentVideo.status === 'processing'
                  ? 'Our AI is enhancing your video with professional editing techniques' 
                  : 'Your video has been successfully processed and is ready for download'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={currentVideo.processing_progress} className="mb-4" />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(currentVideo.processing_progress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Video Preview & Download */}
        {currentVideo && currentVideo.status === 'completed' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
              <CardDescription>
                Your AI-edited video is ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Video Preview</p>
                  <p className="text-sm text-muted-foreground">
                    Click download to get your edited video
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                  {user?.plan === 'free' && <span className="ml-2 text-xs">(with watermark)</span>}
                </Button>
                {user?.plan === 'free' && (
                  <Button variant="outline" onClick={() => onNavigate('payment')}>
                    <Crown className="w-4 h-4 mr-2" />
                    Remove Watermark
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Prompt for Free Users */}
        {user?.plan === 'free' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription>
                Get unlimited AI edits, remove watermarks, and enjoy priority processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Pro Plan Benefits:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Unlimited AI video edits</li>
                    <li>• No watermarks on exported videos</li>
                    <li>• Priority processing queue</li>
                    <li>• Higher upload limits (1GB)</li>
                  </ul>
                </div>
                <Button onClick={() => onNavigate('payment')}>
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}