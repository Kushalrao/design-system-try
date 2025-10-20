# 🎨 Figma Plugin + GitHub Workflow Setup Guide

This guide will help you set up the complete Figma Plugin → GitHub → iOS workflow for your design system.

## 🚀 Complete Workflow Overview

```
Figma Variables → Plugin → GitHub Commit → Actions → Swift Files → Webhook → Local Dev
```

## 📋 Prerequisites

- ✅ Figma account with variables in your file
- ✅ GitHub repository (this project)
- ✅ GitHub Personal Access Token
- ✅ Node.js installed locally
- ✅ Git configured

## 🛠 Step-by-Step Setup

### 1. Install Figma Plugin

1. **Open Figma** and go to your design file
2. **Plugins** → **Development** → **Import plugin from manifest**
3. **Select** `figma-plugin/manifest.json` from this project
4. **Plugin appears** in your plugins list as "Design Tokens Sync"

### 2. Create GitHub Personal Access Token

1. **Go to GitHub** → Settings → Developer settings → Personal access tokens
2. **Generate new token** (classic)
3. **Select scopes:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. **Copy token** (starts with `ghp_`)

### 3. Configure GitHub Repository

1. **Go to your repository** on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **Add repository secrets:**
   - `WEBHOOK_URL`: Your local webhook URL (see step 5)

### 4. Test Plugin Export

1. **Open Figma** with your variables file
2. **Run plugin** "Design Tokens Sync"
3. **Enter credentials:**
   - GitHub Token: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - Repository Owner: `your-username`
   - Repository Name: `your-repo`
4. **Click "Export Variables to GitHub"**
5. **Check GitHub** - you should see a new commit in `tokens/figma-tokens.json`

### 5. Set Up Local Webhook Server

1. **Install dependencies:**
   ```bash
   cd scripts
   npm install express
   ```

2. **Start webhook server:**
   ```bash
   npm run webhook
   ```

3. **Expose to internet** (use ngrok):
   ```bash
   # Install ngrok
   brew install ngrok  # macOS
   
   # Expose local server
   ngrok http 3000
   ```

4. **Copy ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Add webhook to GitHub:**
   - Repository → Settings → Webhooks
   - Add webhook: `https://abc123.ngrok.io/figma-webhook`
   - Content type: `application/json`
   - Events: `Push events`

### 6. Test Complete Workflow

1. **Update variables** in Figma
2. **Run plugin** to export
3. **Check GitHub Actions** - should trigger automatically
4. **Check local webhook** - should receive notification
5. **Check iOS project** - Swift files should update

## 🔧 Commands Reference

### Plugin Commands
```bash
# Start webhook server
npm run webhook

# Generate Swift files manually
npm run generate-swift

# Clean generated files
npm run clean
```

### Figma Plugin
- **Preview Variables**: Shows variables found in Figma
- **Export to GitHub**: Commits tokens to repository

## 📁 File Structure

```
system check/
├── figma-plugin/              # Figma plugin files
│   ├── manifest.json          # Plugin configuration
│   ├── code.js               # Plugin logic
│   ├── ui.html               # Plugin UI
│   └── README.md             # Plugin documentation
├── .github/workflows/         # GitHub Actions
│   └── figma-sync.yml        # Auto-generate Swift files
├── scripts/                   # Sync scripts
│   ├── sync-plugin.js        # Plugin workflow handler
│   └── ...existing files
├── webhook-server.js          # Local webhook server
└── tokens/                    # Generated tokens
    └── figma-tokens.json     # Plugin exports here
```

## 🎯 Token Categories

The plugin automatically categorizes Figma variables:

| Figma Variable Type | Token Category | Swift Output |
|-------------------|---------------|--------------|
| `COLOR` | `color` | `Color.primary` |
| `FLOAT` + spacing | `spacing` | `Spacing.medium` |
| `FLOAT` + radius | `borderRadius` | `BorderRadius.small` |
| `STRING` + font | `typography` | `Font.heading` |
| `FLOAT` + opacity | `opacity` | `Opacity.half` |

## 🚨 Troubleshooting

### Plugin Issues
- **"Failed to load variables"**: Check that variables are local (not from libraries)
- **"GitHub API error"**: Verify token has `repo` scope
- **"Network access denied"**: Plugin needs network permissions

### GitHub Actions Issues
- **Workflow not triggering**: Check file path in workflow (`tokens/figma-tokens.json`)
- **Permission denied**: Ensure `GITHUB_TOKEN` has write permissions

### Webhook Issues
- **Not receiving webhooks**: Check ngrok is running and URL is correct
- **Webhook failing**: Check local git configuration and permissions

## 🔄 Workflow States

### ✅ Success Flow
1. Designer updates Figma variables
2. Plugin exports to GitHub ✅
3. GitHub Actions triggers ✅
4. Swift files generated ✅
5. Webhook notifies local dev ✅
6. Local files updated ✅

### ❌ Failure Points
- Plugin can't access variables
- GitHub token invalid/expired
- Repository permissions issue
- Webhook server down
- Local git issues

## 📊 Monitoring

### GitHub Actions
- Check Actions tab for workflow status
- View logs for detailed error messages

### Webhook Server
- Console shows incoming webhooks
- Health check: `http://localhost:3000/health`

### Plugin
- Browser dev tools show console logs
- UI shows success/error messages

## 🎉 Success Indicators

- ✅ Plugin shows "Successfully exported X variables"
- ✅ GitHub shows new commit with tokens
- ✅ GitHub Actions completes successfully
- ✅ Webhook server receives notification
- ✅ Swift files update in Xcode

## 🔧 Advanced Configuration

### Custom Token Categories
Edit `figma-plugin/code.js` to modify how variables are categorized.

### Custom Swift Generation
Edit `scripts/sync-plugin.js` to change Swift output format.

### Webhook Customization
Edit `webhook-server.js` to add custom processing logic.

## 📞 Support

If you encounter issues:
1. Check console logs in Figma plugin
2. Review GitHub Actions logs
3. Verify webhook server output
4. Ensure all credentials are correct

---

**🎨 Your design system is now fully automated!** Update variables in Figma, and they'll automatically sync to your iOS project. 🚀
