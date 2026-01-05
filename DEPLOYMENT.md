# Railway Deployment Guide

## Quick Setup

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

## Step-by-Step Deployment

### 1. Connect to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository: `YJac16/WBTS-Shadows-Over-Blackthorn-Manor`

### 2. Configure Build Settings

Railway should auto-detect the settings from `package.json`, but you can verify:

**Build Command:**
```
npm run build
```

**Start Command:**
```
npm start
```

**Node Version:**
- Railway will auto-detect from `package.json`
- Requires Node.js 16+ (Vite 5.0.0 requirement)

### 3. Environment Variables

No environment variables are required. The `$PORT` variable is automatically provided by Railway.

### 4. Deploy

1. Railway will automatically:
   - Install dependencies (`npm install`)
   - Run the build command (`npm run build`)
   - Start the application (`npm start`)
2. Wait for deployment to complete
3. Your game will be live at the Railway-provided URL

## Verification

After deployment, verify:

1. ✅ Build completes successfully
2. ✅ Application starts without errors
3. ✅ Game loads at the Railway URL
4. ✅ All game features work (navigation, clues, accusations)

## Troubleshooting

### Build Fails

- Check Node.js version (should be 16+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Application Won't Start

- Verify `$PORT` environment variable is set (Railway sets this automatically)
- Check that `vite preview` command works locally
- Review application logs in Railway dashboard

### Port Issues

- Railway automatically provides `$PORT` environment variable
- The start command uses `--port $PORT --host` to bind to Railway's port
- No manual port configuration needed

## Manual Configuration (if needed)

If Railway doesn't auto-detect:

1. Go to your project settings
2. Navigate to **"Settings"** → **"Build & Deploy"**
3. Set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Root Directory:** `/` (default)

## Files Included

- `package.json` - Contains build and start scripts
- `railway.json` - Railway-specific configuration (optional)
- `vite.config.js` - Vite build configuration
- `.gitignore` - Excludes `node_modules` and `dist` from repo

## Notes

- The `dist/` folder is generated during build and contains the production files
- Railway will serve the built files from the `dist/` directory
- The game is a static site, so no database or backend is required
- All game logic runs client-side in the browser

