# CutCraft AI - Video Editing Platform

## Project Overview
This is a complete video editing platform built with React and Supabase that allows users to upload videos and edit them instantly using AI technology. The project has been successfully configured to run in the Replit environment.

## Architecture
- **Frontend**: React 18 with TypeScript and Vite build system
- **Styling**: Tailwind CSS with shadcn/ui component library  
- **UI Components**: Radix UI primitives for accessibility
- **Backend**: Originally designed for Supabase with Deno Edge Functions
- **Authentication**: Supabase Auth with email/password and Google OAuth

## Current Setup Status
✅ Frontend React application configured and running
✅ Vite build system with TypeScript support
✅ Tailwind CSS with custom design system
✅ All UI dependencies installed (Radix UI, shadcn/ui)
✅ Development server configured for Replit proxy (0.0.0.0:5000)
✅ Deployment configuration set up for production

## Recent Changes (2025-09-25)
- Moved project files to proper src/ directory structure
- Created package.json with all necessary dependencies
- Set up Vite configuration with proper alias resolution
- Added Tailwind CSS directives to globals.css
- Installed all missing UI component dependencies
- Configured workflows for development server on port 5000
- Set up deployment configuration for autoscale target

## Known Limitations
- Backend Deno server functions won't run in Node.js environment
- Supabase integration needs proper environment variables setup
- Video upload/processing features require backend implementation

## Development Workflow
- Run: `npm run dev` (configured in Frontend Server workflow)
- Build: `npm run build`
- Preview: `npm run preview`

## Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── styles/             # Global styles and Tailwind config
├── types/              # TypeScript type definitions
├── utils/              # Supabase client utilities
└── App.tsx             # Main application component
```