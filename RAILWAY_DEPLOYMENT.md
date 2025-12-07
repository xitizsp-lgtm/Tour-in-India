# 🚂 Railway Deployment Guide for Echoguard API

## ✅ Pre-Deployment Checklist

Your project is now **READY FOR RAILWAY DEPLOYMENT**! 

Files created/updated:
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process configuration
- ✅ `runtime.txt` - Python version specification
- ✅ `requirements.txt` - Updated with librosa
- ✅ `.railwayignore` - Ignore unnecessary files during deployment
- ✅ `.gitignore` - Updated to allow model files
- ✅ `README.md` - Complete documentation

## 🚀 Deploy Now (Choose One Method)

### Method 1: Railway Dashboard (Recommended - No CLI needed)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin master
   ```

2. **Go to Railway:**
   - Visit [railway.app](https://railway.app)
   - Click "Login" (sign in with GitHub)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `Tour-in-India`
   - Railway will automatically deploy! 🎉

3. **Get your URL:**
   - Click on your project
   - Go to "Settings" tab
   - Click "Generate Domain"
   - Your API will be live at: `https://your-app-name.up.railway.app`

4. **Test it:**
   ```bash
   curl https://your-app-name.up.railway.app/
   ```

---

### Method 2: Railway CLI (For Developers)

1. **Install Railway CLI:**
   ```bash
   # Using npm
   npm install -g @railway/cli
   
   # OR using Homebrew (macOS)
   brew install railway
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   cd /Users/akshaykale/projects/kshitij/Tour-in-India
   railway init
   ```
   - Enter a project name when prompted
   - Railway will link your local directory

4. **Deploy:**
   ```bash
   railway up
   ```
   - This uploads your code and starts deployment
   - Watch the build logs in real-time!

5. **Generate a public URL:**
   ```bash
   railway domain
   ```

6. **Check deployment status:**
   ```bash
   railway status
   ```

7. **View logs:**
   ```bash
   railway logs
   ```

---

## 📊 What Railway Will Do

When you deploy, Railway automatically:
1. ✅ Detects Python application
2. ✅ Installs Python 3.13.5 (from `runtime.txt`)
3. ✅ Installs all dependencies from `requirements.txt` (~373MB)
4. ✅ Loads your model files (`svm_model.pkl`, `scaler.pkl`)
5. ✅ Starts your FastAPI server
6. ✅ Assigns a public URL
7. ✅ Monitors health and auto-restarts if needed

**Build time:** ~3-5 minutes (first deployment)
**Subsequent deploys:** ~1-2 minutes

---

## 🔗 Your API Endpoints (After Deployment)

Replace `your-app-name.up.railway.app` with your actual Railway URL:

### Health Check
```bash
curl https://your-app-name.up.railway.app/
```

### Predict Audio
```bash
curl -X POST "https://your-app-name.up.railway.app/predict" \
  -H "Content-Type: multipart/form-data" \
  -F "audio_file=@your_audio.wav"
```

### Interactive API Docs
Open in browser:
```
https://your-app-name.up.railway.app/docs
```

---

## 💰 Railway Pricing

**Free Tier:**
- ✅ 500 hours/month of usage
- ✅ $5 credit/month
- ✅ Perfect for development and low-traffic apps
- ✅ No credit card required to start

**If you exceed free tier:**
- ~$0.000231/minute (roughly $10/month for always-on)
- You'll get email notifications before charges

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** "Module not found" error
**Solution:** Make sure all dependencies are in `requirements.txt`

**Issue:** "Model file not found"
**Solution:** 
```bash
# Make sure model files are committed
git add svm_model.pkl scaler.pkl -f
git commit -m "Add model files for deployment"
git push
```

### Application Crashes

**Issue:** App crashes on startup
**Solution:** Check Railway logs:
```bash
railway logs
```

### Port Issues

Railway automatically provides the `$PORT` environment variable. The `railway.json` file is already configured to use it.

### Timeout Issues

If audio processing takes too long:
1. Railway has no timeout limits (unlike Vercel's 10s limit)
2. But if requests take >30s, consider optimizing your model

---

## 📈 Monitoring Your Deployment

### In Railway Dashboard:
- **Metrics:** View CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Deployments:** History of all deployments
- **Variables:** Add environment variables if needed

### Using CLI:
```bash
# View logs
railway logs --follow

# Check status
railway status

# View environment variables
railway variables

# Open in browser
railway open
```

---

## 🔄 Updating Your Deployment

### From Dashboard:
1. Push code to GitHub
2. Railway auto-deploys (if connected to GitHub)

### From CLI:
```bash
# Just run this whenever you want to deploy
railway up
```

---

## 🎯 Next Steps After Deployment

1. **Test your live API:**
   ```bash
   curl https://your-app-name.up.railway.app/docs
   ```

2. **Share your API:**
   - Send the `/docs` URL to teammates
   - Integrate with your frontend application

3. **Monitor usage:**
   - Check Railway dashboard for traffic
   - Set up alerts if needed

4. **Optional enhancements:**
   - Add authentication (API keys)
   - Set up custom domain
   - Add rate limiting
   - Enable HTTPS (enabled by default on Railway)

---

## 📚 Useful Commands Summary

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up

# View logs
railway logs --follow

# Check status
railway status

# Generate domain
railway domain

# Open in browser
railway open
```

---

## 🆘 Need Help?

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Railway Discord:** [discord.gg/railway](https://discord.gg/railway)
- **Railway Status:** [status.railway.app](https://status.railway.app)

---

## ✨ You're All Set!

Your project is **100% ready** for Railway deployment. Just choose your deployment method above and follow the steps!

Good luck! 🚀

