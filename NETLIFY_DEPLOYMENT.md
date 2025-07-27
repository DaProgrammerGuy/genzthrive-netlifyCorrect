# Netlify Deployment Guide

## Overview
Your Gen Z Tech-Business Roadmap app is a full-stack application with React frontend and Express.js backend. Netlify will host the frontend, and we'll use Netlify Functions for the backend API.

## Prerequisites
1. GitHub repository set up (see GITHUB_SETUP.md)
2. Netlify account (free at netlify.com)
3. Database URL from Neon or your PostgreSQL provider

## Step 1: Prepare for Netlify Deployment

### Files Already Configured ✅
- `netlify.toml` - Build and routing configuration
- `netlify/functions/api.ts` - Serverless backend function
- `build-netlify.js` - Custom build script
- `netlify-seed.js` - Database seeding script

### Environment Variables Needed
You'll need to set these in Netlify dashboard:
- `DATABASE_URL` - Your PostgreSQL connection string
- `PGHOST` - Database host
- `PGDATABASE` - Database name  
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGPORT` - Database port (usually 5432)

## Step 2: Deploy to Netlify

### Option A: Deploy via GitHub (Recommended)

1. **Connect Repository**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

2. **Configure Build Settings**:
   - **Branch to deploy**: `main`
   - **Build command**: `node build-netlify.js`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
   - Netlify will auto-detect most settings from `netlify.toml`

3. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all your database environment variables
   - **Important**: Don't include quotes around values

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy automatically
   - Your app will be available at `https://your-site-name.netlify.app`

### Option B: Manual Deploy

1. **Build Locally**:
   ```bash
   npm run build
   ```

2. **Deploy Built Files**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Drag and drop the `dist` folder to Netlify
   - Set environment variables in site settings

## Step 3: Configure Custom Domain (Optional)

1. **Purchase Domain** (from Namecheap, GoDaddy, etc.)

2. **Add Custom Domain in Netlify**:
   - Site settings → Domain management
   - Add custom domain
   - Follow DNS configuration instructions

3. **SSL Certificate**:
   - Netlify provides free SSL automatically
   - Your site will be accessible via HTTPS

## Step 4: Environment Variables Setup

In Netlify dashboard, add these variables:

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
PGHOST=your-neon-host.aws.neon.tech
PGDATABASE=your-database-name
PGUSER=your-username
PGPASSWORD=your-password
PGPORT=5432
NODE_ENV=production
```

## Step 5: Continuous Deployment

Once connected to GitHub:
- **Automatic deploys**: Every push to `main` branch triggers deployment
- **Deploy previews**: Pull requests get preview URLs
- **Branch deploys**: Deploy from different branches for testing

## Step 6: Monitor and Debug

### View Deploy Logs:
- Go to Deploys tab in Netlify dashboard
- Click on any deploy to see build logs
- Check for errors in Functions tab

### Common Issues:

1. **Build Fails**:
   ```bash
   # Check if build works locally
   npm run build
   
   # Check Node.js version in netlify.toml
   ```

2. **API Functions Not Working**:
   - Check Functions tab in Netlify dashboard
   - Verify environment variables are set
   - Check function logs for errors

3. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Ensure database allows connections from Netlify IPs
   - Check SSL requirements (`?sslmode=require`)

## Step 7: Performance Optimization

### Enable Features:
- **Asset optimization**: Auto-enabled by Netlify
- **Gzip compression**: Auto-enabled
- **CDN**: Global distribution included

### Custom Headers (Optional):
Add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Step 8: Analytics and Monitoring

1. **Netlify Analytics**:
   - Enable in site settings
   - View traffic, performance metrics

2. **Form Handling** (if needed later):
   - Netlify handles forms automatically
   - Add `netlify` attribute to forms

## Post-Deployment Checklist

✅ **Frontend loads correctly**
✅ **All interactive features work** (skills, income streams, roadmap)
✅ **Database connections successful**
✅ **LinkedIn integration functional**
✅ **Mobile responsiveness maintained**
✅ **SSL certificate active**
✅ **Custom domain configured** (if applicable)

## Deployment Commands Summary

```bash
# For local testing before deploy
npm run build
npm run preview

# Check build size
npm run build && du -sh dist/

# Test production build locally
npm run start
```

## Your Live App URLs

After deployment, your app will be available at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://yourdomain.com` (if configured)

The app will include:
- Interactive roadmap progression
- Skills tracking with real-time updates  
- Income stream management
- LinkedIn integration
- Mobile-optimized experience
- Progressive Web App features

Your database will remain connected to Neon (or your PostgreSQL provider), so all user data and interactions will persist across sessions.