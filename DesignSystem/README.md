//
//  README.md
//  Design System
//
//  Setup and usage instructions for the iOS Design System with Figma sync
//

# iOS Design System with Figma Sync

This project includes an automated design system that syncs design tokens from Figma Variables API to Swift code.

## 🚀 Quick Start

### 1. Setup Figma Access

1. Get your Figma Personal Access Token:
   - Go to [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)
   - Generate a new personal access token

2. Get your Figma File Key:
   - Open your Figma file
   - Copy the file key from the URL: `https://www.figma.com/file/FILE_KEY/File-Name`

3. Configure environment:
   ```bash
   cd scripts
   cp env.example .env
   # Edit .env with your token and file key
   ```

### 2. Install Dependencies

```bash
cd scripts
npm install
```

### 3. Sync Design Tokens

```bash
npm run sync
```

This will:
- Fetch variables from your Figma file
- Transform them to Style Dictionary format
- Generate Swift files in `DesignSystem/Tokens/`

### 4. Use in Your App

```swift
import SwiftUI

struct MyView: View {
    var body: some View {
        Text("Hello World")
            .foregroundColor(.primary)      // From Figma colors
            .font(.headline)                // From Figma typography
            .padding(.medium)               // From Figma spacing
            .background(Color.secondary)
            .cornerRadius(.small)           // From Figma border radius
    }
}
```

## 📁 Project Structure

```
system check/
├── DesignSystem/
│   ├── Tokens/              # Auto-generated Swift files
│   │   ├── Colors.swift
│   │   ├── Typography.swift
│   │   ├── Spacing.swift
│   │   ├── BorderRadius.swift
│   │   └── Shadows.swift
│   ├── Components/          # Future custom components
│   └── DesignSystem.swift   # Main design system interface
├── scripts/
│   ├── sync-figma.js        # Figma sync script
│   ├── package.json         # Node dependencies
│   └── .env                 # Your Figma credentials
├── tokens/
│   ├── figma-tokens.json    # Raw Figma data
│   └── style-dictionary.config.js
└── .gitignore               # Excludes sensitive files
```

## 🔄 Workflow

1. **Design in Figma**: Create/update variables (colors, spacing, typography, etc.)
2. **Run sync**: `cd scripts && npm run sync`
3. **Build app**: Xcode automatically detects updated Swift files
4. **Use tokens**: All your SwiftUI code uses the latest design tokens

## 🎨 Supported Token Types

- **Colors**: Hex colors → `Color.primary`, `Color.secondary`
- **Typography**: Font sizes/weights → `Font.headline`, `Font.body`
- **Spacing**: Padding/margins → `Spacing.small`, `Spacing.large`
- **Border Radius**: Corner radius → `BorderRadius.small`, `BorderRadius.large`
- **Shadows**: Drop shadows → `Shadow.card`, `Shadow.elevated`

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Required
FIGMA_ACCESS_TOKEN=your_token_here
FIGMA_FILE_KEY=your_file_key_here

# Optional - filter specific collections/modes
FIGMA_COLLECTIONS=Light Mode,Dark Mode
FIGMA_MODES=Default
```

### Style Dictionary Config

The `tokens/style-dictionary.config.js` file controls how Figma variables are transformed into Swift code. You can customize:

- Token naming conventions
- Value transformations
- Output file structure
- Swift code generation

## 🔧 Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Make sure `.env` file exists in `scripts/` directory
   - Check that `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_KEY` are set

2. **"Failed to fetch variables from Figma"**
   - Verify your access token is valid
   - Check that the file key is correct
   - Ensure you have access to the Figma file

3. **"No tokens generated"**
   - Make sure your Figma file has variables defined
   - Check that variable names match expected patterns
   - Verify collections/modes filters aren't too restrictive

### Debug Mode

Add debug logging to see what's happening:

```bash
DEBUG=* npm run sync
```

## 🚀 Future Enhancements

- **Webhook Integration**: Automatic sync when Figma files change
- **Custom Components**: Pre-built SwiftUI components using design tokens
- **Theme Support**: Light/dark mode switching
- **Documentation**: Auto-generated style guide from tokens

## 📝 Notes

- All files in `DesignSystem/Tokens/` are auto-generated - don't edit them manually
- The sync script preserves your existing Swift code structure
- Design tokens are type-safe and provide autocomplete in Xcode
- Changes in Figma require running the sync script to update your app
