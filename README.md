# CutCraft AI - Video Editing Platform

A complete video editing platform built with React and Supabase that allows users to upload videos and edit them instantly using AI technology.

## 🚀 Features

### Core Pages
- **Landing Page**: Hero section with feature showcase and call-to-action
- **Authentication**: Email/password and Google OAuth sign-in options
- **Dashboard**: Video upload, processing, and management interface
- **Payment**: Free and Pro pricing tiers with subscription management
- **Settings**: User profile and billing management

### User Features
- **Free Plan**: 5 AI edits with watermarks, 100MB upload limit
- **Pro Plan**: Unlimited edits, no watermarks, 1GB upload limit, priority processing
- **Video Management**: Upload, process, and manage video files
- **Usage Tracking**: Real-time tracking of edit limits and usage
- **Subscription Management**: Upgrade, downgrade, and billing history

### Technical Features
- **Real Authentication**: Supabase Auth with email/password and Google OAuth
- **File Storage**: Secure video file upload and storage via Supabase Storage
- **Database Integration**: User profiles, subscriptions, and usage tracking
- **Protected Routes**: Server-side authentication for secure API endpoints
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: shadcn/ui component library
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Server**: Hono web server running on Supabase Edge Functions
- **Icons**: Lucide React
- **File Handling**: Native HTML5 file APIs with progress tracking

## 📁 Project Structure

```
├── App.tsx                 # Main application component with routing
├── components/
│   ├── Landing.tsx         # Landing page with hero and features
│   ├── Auth.tsx           # Authentication page
│   ├── Dashboard.tsx      # Main dashboard for video management
│   ├── Payment.tsx        # Pricing and subscription page
│   ├── Settings.tsx       # User settings and billing management
│   └── ui/               # shadcn/ui components
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx  # Main server with API routes
│           └── kv_store.tsx # Database utilities (protected)
├── utils/
│   └── supabase/
│       ├── client.tsx     # Frontend Supabase client and API helpers
│       └── info.tsx       # Supabase configuration (protected)
└── styles/
    └── globals.css        # Custom design system and typography
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase project
- Google OAuth credentials (optional, for Google sign-in)

### Environment Setup

1. **Supabase Configuration**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Generate a service role key
   - The following environment variables are already configured:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY` 
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_DB_URL`

2. **Google OAuth Setup** (Optional)
   - Follow the Supabase guide: https://supabase.com/docs/guides/auth/social-login/auth-google
   - Configure OAuth providers in your Supabase dashboard
   - Without this setup, users will see a "provider is not enabled" error for Google sign-in

### Database Setup

The application uses a flexible key-value store table (`kv_store_95bd8cbb`) that handles:
- User profiles and metadata
- Subscription tracking
- Usage limits and history
- Video file metadata

No additional database setup is required - the backend automatically manages the schema.

### File Storage Setup

The server automatically creates the required Supabase Storage buckets:
- Private buckets for secure video file storage
- Automatic signed URL generation for file access
- Separate storage limits for free (100MB) and pro (1GB) users

## 📊 API Endpoints

All API endpoints are prefixed with `/make-server-95bd8cbb/` and require proper authentication:

### Authentication Required Routes
- `POST /auth/signup` - Create new user account
- `GET /user/profile` - Get user profile and subscription info
- `POST /user/upgrade` - Upgrade user to pro plan
- `POST /videos/upload` - Handle video file uploads
- `POST /videos/process` - Process videos with AI
- `GET /videos/list` - Get user's video library

### Public Routes
- Health check and basic info endpoints

## 💳 Subscription Model

### Free Plan
- 5 AI video edits per month
- 100MB upload limit per video
- Watermarked output
- Standard processing speed

### Pro Plan ($9.99/month)
- Unlimited AI video edits
- 1GB upload limit per video  
- No watermarks
- Priority processing
- Advanced editing features

## 🎨 Design System

The application uses a custom design system built with Tailwind CSS v4:

- **Base font size**: 14px
- **Typography**: Automatic typography for headings, paragraphs, and interactive elements
- **Color scheme**: Light/dark mode support with consistent design tokens
- **Components**: Fully styled shadcn/ui components with custom theming
- **Responsive**: Mobile-first responsive design

## 🔒 Security Features

- **Authentication**: Supabase Auth with secure session management
- **Protected Routes**: Server-side authentication for all sensitive operations
- **File Security**: Private storage buckets with signed URLs
- **API Security**: Bearer token authentication for all API calls
- **Input Validation**: Comprehensive validation on both frontend and backend

## 🚀 Deployment

### Frontend Deployment
The React application can be deployed to any static hosting service:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Backend Deployment
The backend is already deployed as Supabase Edge Functions:
- Automatic scaling and global distribution
- Built-in monitoring and logging
- Secure environment variable management

### Environment Variables for Production
Ensure all Supabase credentials are properly configured in your deployment environment.

## 🔧 Development

### Local Development
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. The app will run on `http://localhost:3000`

### Testing Authentication
- Email/password sign-up creates accounts with auto-confirmed emails
- Google OAuth requires proper configuration in Supabase dashboard
- All user sessions persist across browser refreshes

### File Upload Testing
- Test with various video formats (MP4, MOV, AVI)
- Verify file size limits are enforced (100MB free, 1GB pro)
- Check upload progress and error handling

## 📝 Usage Limits & Monitoring

The application tracks and enforces:
- Monthly edit limits (5 for free, unlimited for pro)
- File size restrictions per upload
- Total storage usage per user
- Processing queue priority based on subscription

## 🐛 Troubleshooting

### Common Issues

1. **Google OAuth "provider is not enabled"**
   - Complete Google OAuth setup in Supabase dashboard
   - Follow: https://supabase.com/docs/guides/auth/social-login/auth-google

2. **File upload failures**
   - Check file size limits
   - Verify user subscription status
   - Check network connectivity

3. **Authentication issues**
   - Verify Supabase credentials
   - Check browser console for detailed error messages
   - Ensure service role key is not exposed to frontend

## 🤝 Contributing

This is a complete, production-ready application. Key areas for enhancement:
- Additional video editing AI features
- Mobile app development
- Advanced subscription tiers
- Team collaboration features

## 📄 License

Private project - all rights reserved.

---

**Built with ❤️ using React, Supabase, and modern web technologies**