# Figma Plugin: Design Tokens Sync

This plugin syncs Figma Variables to your iOS design system via GitHub.

## 🚀 Features

- ✅ **Variables API Access** - Direct access to Figma Variables (no Enterprise required)
- ✅ **GitHub Integration** - Commits tokens directly to your repository
- ✅ **Real-time Sync** - Updates design tokens instantly
- ✅ **Team Collaboration** - Multiple designers can update tokens
- ✅ **Version Control** - All changes tracked in Git

## 📋 Setup Instructions

### 1. Install Plugin in Figma

1. Open Figma
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this directory
4. The plugin will appear in your plugins list

### 2. Configure GitHub Access

1. **Create GitHub Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Copy the token (starts with `ghp_`)

2. **Get Repository Info:**
   - Repository owner: Your GitHub username
   - Repository name: Your project repository name

### 3. Use the Plugin

1. **Open your Figma file** with variables
2. **Run the plugin** from Plugins menu
3. **Enter your GitHub credentials:**
   - GitHub Token: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - Repository Owner: `your-username`
   - Repository Name: `your-repo`
4. **Click "Export Variables to GitHub"**

## 🔄 Workflow

```
Figma Variables → Plugin → GitHub Commit → Webhook → iOS Project
```

1. **Designer updates variables** in Figma
2. **Plugin exports** variables to GitHub
3. **GitHub Actions** generates Swift files
4. **Webhook** updates local development environment

## 📁 Generated Files

The plugin creates/updates:
- `tokens/figma-tokens.json` - Raw variable data
- `DesignSystem/Tokens/*.swift` - Generated Swift files

## 🛠 Plugin Structure

```
figma-plugin/
├── manifest.json    # Plugin configuration
├── code.js         # Main plugin logic
├── ui.html         # Plugin user interface
└── package.json    # Dependencies
```

## 🔧 Technical Details

### Variables API Access
```javascript
// Get all local variables
const variables = await figma.variables.getLocalVariablesAsync();

// Transform to tokens
const tokens = transformVariablesToTokens(variables);
```

### GitHub Integration
```javascript
// Commit to GitHub
await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/tokens/figma-tokens.json`, {
  method: 'PUT',
  headers: { 'Authorization': `token ${githubToken}` },
  body: JSON.stringify({ content: encodedTokens })
});
```

## 🎯 Token Categories

The plugin automatically categorizes variables:

- **Colors** (`COLOR` type) → `color` tokens
- **Spacing** (`FLOAT` + spacing keywords) → `spacing` tokens  
- **Border Radius** (`FLOAT` + radius keywords) → `borderRadius` tokens
- **Typography** (`STRING` + font keywords) → `typography` tokens
- **Opacity** (`FLOAT` + opacity keywords) → `opacity` tokens

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to load variables"**
   - Make sure your Figma file has variables defined
   - Check that variables are local (not from libraries)

2. **"GitHub API error"**
   - Verify your GitHub token has `repo` scope
   - Check repository owner/name spelling
   - Ensure repository exists and is accessible

3. **"Network access denied"**
   - Plugin needs network access for GitHub API
   - Check Figma plugin permissions

### Debug Mode

Open browser dev tools in Figma to see console logs:
- Right-click in Figma → Inspect Element
- Check Console tab for error messages

## 📝 Next Steps

After setting up the plugin:

1. **Configure GitHub Actions** for automatic Swift generation
2. **Set up webhook** for local development sync
3. **Test the complete workflow** from Figma to iOS

## 🤝 Contributing

This plugin is part of the iOS Design System project. See the main README for development guidelines.

## 📄 License

MIT License - see LICENSE file for details.
