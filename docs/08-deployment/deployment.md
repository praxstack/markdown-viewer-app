# 🚀 Deployment Guide - Markdown Viewer Pro

This guide covers multiple **FREE** hosting options to deploy your Markdown Viewer Pro application.

---

## 📋 Table of Contents

- [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
- [Option 2: Netlify](#option-2-netlify)
- [Option 3: GitHub Pages](#option-3-github-pages)
- [Option 4: Cloudflare Pages](#option-4-cloudflare-pages)
- [Option 5: Render](#option-5-render)
- [Comparison Table](#comparison-table)

---

## Option 1: Vercel (Recommended) ⚡

**Why Vercel?**

- Fastest deployment (< 1 minute)
- Automatic HTTPS
- Free custom domain support
- Excellent performance
- Zero configuration needed

### Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Deploy from your project directory**:

   ```bash
   cd /Users/praxlannister/Documents/Project\ Workspace/markdown-viewer-app
   vercel
   ```

3. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No**
   - Project name? `markdown-viewer-app` (or your choice)
   - Directory? `./` (current directory)
   - Override settings? **No**

4. **Done!** 🎉
   - Production URL: `https://markdown-viewer-app.vercel.app`
   - You'll get a unique URL immediately

### Subsequent Deployments

```bash
vercel --prod
```

### Custom Domain (Optional)

```bash
vercel domains add yourdomain.com
```

---

## Option 2: Netlify 🌐

**Why Netlify?**

- Simple drag-and-drop deployment
- Free subdomain
- Continuous deployment from Git
- Built-in forms and functions

### Method A: Netlify CLI

1. **Install Netlify CLI**:

   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:

   ```bash
   netlify login
   ```

3. **Deploy**:

   ```bash
   cd /Users/praxlannister/Documents/Project\ Workspace/markdown-viewer-app
   netlify deploy --prod
   ```

4. **Follow prompts**:
   - Create & configure a new site
   - Site name: `markdown-viewer-app` (or your choice)
   - Deploy path: `./` (current directory)

### Method B: Netlify Web Interface

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up / Login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select `markdown-viewer-app` repository
5. Build settings:
   - Build command: (leave empty)
   - Publish directory: `./`
6. Click "Deploy site"

**Live URL**: `https://markdown-viewer-app.netlify.app`

---

## Option 3: GitHub Pages 📄

**Why GitHub Pages?**

- Free with GitHub account
- Already connected to your repository
- Simple setup
- Custom domain support

### Steps

1. **Enable GitHub Pages**:

   ```bash
   # Your code is already pushed to GitHub
   # Go to: https://github.com/PrakharMNNIT/markdown-viewer-app/settings/pages
   ```

2. **Configure Source**:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Click Save

3. **Wait 1-2 minutes** for deployment

4. **Access your site**:

   ```
   https://prakharmnnit.github.io/markdown-viewer-app/
   ```

### Using Custom Domain

1. Go to Settings → Pages
2. Add custom domain: `yourdomain.com`
3. Add DNS records:

   ```
   A record: 185.199.108.153
   A record: 185.199.109.153
   A record: 185.199.110.153
   A record: 185.199.111.153
   ```

4. Enable "Enforce HTTPS"

---

## Option 4: Cloudflare Pages ☁️

**Why Cloudflare Pages?**

- Fastest global CDN
- Unlimited bandwidth
- Free SSL
- Advanced security features

### Steps

1. Go to [https://pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up / Login
3. Click "Create a project"
4. Connect to GitHub
5. Select `markdown-viewer-app` repository
6. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
7. Click "Save and Deploy"

**Live URL**: `https://markdown-viewer-app.pages.dev`

---

## Option 5: Render 🎨

**Why Render?**

- Free tier with no credit card
- Auto-deploy on git push
- Custom domains

### Steps

1. Go to [https://render.com](https://render.com)
2. Sign up / Login with GitHub
3. Click "New" → "Static Site"
4. Connect `markdown-viewer-app` repository
5. Settings:
   - Name: `markdown-viewer-app`
   - Build command: (leave empty)
   - Publish directory: `.`
6. Click "Create Static Site"

**Live URL**: `https://markdown-viewer-app.onrender.com`

---

## 📊 Comparison Table

| Platform         | Setup Time | Free Tier    | Custom Domain | Auto Deploy | Speed  | CDN       |
| ---------------- | ---------- | ------------ | ------------- | ----------- | ------ | --------- |
| **Vercel**       | ⚡ 1 min   | ✅ Generous  | ✅ Free       | ✅ Yes      | ⚡⚡⚡ | ✅ Global |
| **Netlify**      | 2 min      | ✅ Good      | ✅ Free       | ✅ Yes      | ⚡⚡⚡ | ✅ Global |
| **GitHub Pages** | 3 min      | ✅ Unlimited | ✅ Free       | ✅ Yes      | ⚡⚡   | ✅ GitHub |
| **Cloudflare**   | 3 min      | ✅ Unlimited | ✅ Free       | ✅ Yes      | ⚡⚡⚡ | ✅ Best   |
| **Render**       | 4 min      | ✅ Limited   | ✅ Paid       | ✅ Yes      | ⚡     | ✅ Yes    |

---

## 🎯 Recommended Approach

### For Fastest Deployment

**Use Vercel** - One command, instant deployment

```bash
npm install -g vercel
vercel
```

### For GitHub Integration

**Use GitHub Pages** - Already connected, no extra signup

### For Best Performance

**Use Cloudflare Pages** - Best CDN, fastest global delivery

---

## 🔧 Post-Deployment Checklist

After deployment, verify:

- ✅ Site loads correctly
- ✅ All themes work
- ✅ View mode buttons function
- ✅ Mermaid diagrams render
- ✅ Code syntax highlighting works
- ✅ Export feature functions
- ✅ LocalStorage persistence works
- ✅ Mobile responsive design

---

## 🌐 Environment Variables

This app doesn't require any environment variables! 🎉

Everything runs client-side with no backend needed.

---

## 📝 Quick Deploy Commands

### Vercel

```bash
cd /Users/praxlannister/Documents/Project\ Workspace/markdown-viewer-app
vercel --prod
```

### Netlify

```bash
cd /Users/praxlannister/Documents/Project\ Workspace/markdown-viewer-app
netlify deploy --prod
```

### Update GitHub Pages

```bash
git push origin main
# Automatically deploys
```

---

## 🆘 Troubleshooting

### Issue: Site not loading

**Solution**: Check if all files are committed and pushed to GitHub

### Issue: 404 errors

**Solution**: Ensure `index.html` is in root directory

### Issue: Styles not loading

**Solution**: Check if `style.css` and theme files are accessible

### Issue: JavaScript not working

**Solution**: Verify `script.js` is loaded correctly

---

## 🎉 Success

Your Markdown Viewer Pro is now live and accessible worldwide!

**Share your deployment:**

- Production URL: `https://your-app-name.platform.app`
- GitHub: `https://github.com/PrakharMNNIT/markdown-viewer-app`

---

## 📱 Mobile Testing

Test your deployment on:

- iOS Safari
- Android Chrome
- Mobile Firefox

All view modes should work responsively!

---

## 🔄 Continuous Deployment

With Vercel, Netlify, or GitHub Pages, every `git push` automatically deploys:

```bash
git add .
git commit -m "✨ feat: new feature"
git push origin main
# Automatically deploys in 30-60 seconds!
```

---

## 💡 Pro Tips

1. **Use Vercel for speed** - Fastest deployment and best DX
2. **Use GitHub Pages for simplicity** - Already integrated
3. **Use Cloudflare for scale** - Best for high traffic
4. **Add custom domain** - Looks more professional
5. **Enable HTTPS** - All platforms provide free SSL
6. **Monitor analytics** - Use built-in analytics on Vercel/Netlify

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Pages Guide](https://docs.github.com/en/pages)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)

---

**Need Help?** Open an issue on GitHub:
<https://github.com/PrakharMNNIT/markdown-viewer-app/issues>

---

**Deployed with ❤️ by Prax Lannister**
