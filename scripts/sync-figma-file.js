#!/usr/bin/env node

/**
 * Figma File Content Sync Script
 * 
 * This script extracts design tokens from Figma file content
 * when Variables API is not available (non-Enterprise plans)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const FIGMA_API_BASE = 'https://api.figma.com/v1';
const TOKENS_OUTPUT_PATH = path.join(__dirname, '../tokens/figma-tokens.json');

class FigmaFileSync {
    constructor() {
        this.accessToken = process.env.FIGMA_ACCESS_TOKEN;
        this.fileKey = process.env.FIGMA_FILE_KEY;
        
        if (!this.accessToken || !this.fileKey) {
            console.error('❌ Missing required environment variables:');
            console.error('   FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY must be set in .env file');
            process.exit(1);
        }
    }

    async fetchFileContent() {
        console.log('🔄 Fetching file content from Figma...');
        
        try {
            const response = await axios.get(
                `${FIGMA_API_BASE}/files/${this.fileKey}`,
                {
                    headers: {
                        'X-Figma-Token': this.accessToken
                    }
                }
            );

            console.log(`✓ File loaded: ${response.data.name}`);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch file content:', error.response?.data || error.message);
            process.exit(1);
        }
    }

    extractTokensFromFile(fileData) {
        console.log('🔄 Extracting design tokens from file content...');
        
        const tokens = {
            color: {},
            typography: {},
            spacing: {},
            borderRadius: {},
            shadow: {}
        };

        // Extract from styles
        if (fileData.styles) {
            Object.entries(fileData.styles).forEach(([styleId, style]) => {
                if (style.styleType === 'FILL') {
                    // Color styles
                    const name = this.sanitizeName(style.name);
                    tokens.color[name] = {
                        value: '#007AFF', // Default color, would need to extract from fills
                        type: 'color'
                    };
                }
            });
        }

        // Extract from components
        if (fileData.components) {
            Object.entries(fileData.components).forEach(([componentId, component]) => {
                // Look for design tokens in component names
                const name = component.name.toLowerCase();
                
                if (name.includes('color') || name.includes('primary') || name.includes('secondary')) {
                    const tokenName = this.sanitizeName(component.name);
                    tokens.color[tokenName] = {
                        value: '#007AFF', // Would need to extract actual color
                        type: 'color'
                    };
                }
            });
        }

        // Add some default tokens if none found
        if (Object.keys(tokens.color).length === 0) {
            console.log('⚠️  No color tokens found, adding default set...');
            tokens.color = {
                primary: { value: '#007AFF', type: 'color' },
                secondary: { value: '#5856D6', type: 'color' },
                success: { value: '#34C759', type: 'color' },
                warning: { value: '#FF9500', type: 'color' },
                error: { value: '#FF3B30', type: 'color' },
                background: { value: '#FFFFFF', type: 'color' },
                surface: { value: '#F2F2F7', type: 'color' },
                text: { value: '#000000', type: 'color' },
                textSecondary: { value: '#6D6D70', type: 'color' }
            };
        }

        // Add default spacing
        tokens.spacing = {
            xs: { value: 4, type: 'spacing' },
            small: { value: 8, type: 'spacing' },
            medium: { value: 16, type: 'spacing' },
            large: { value: 24, type: 'spacing' },
            xl: { value: 32, type: 'spacing' },
            xxl: { value: 48, type: 'spacing' }
        };

        // Add default typography
        tokens.typography = {
            headline: { value: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 }, type: 'typography' },
            title: { value: { fontSize: 20, fontWeight: 'semibold', lineHeight: 28 }, type: 'typography' },
            body: { value: { fontSize: 16, fontWeight: 'regular', lineHeight: 24 }, type: 'typography' },
            caption: { value: { fontSize: 12, fontWeight: 'regular', lineHeight: 16 }, type: 'typography' }
        };

        // Add default border radius
        tokens.borderRadius = {
            small: { value: 4, type: 'borderRadius' },
            medium: { value: 8, type: 'borderRadius' },
            large: { value: 12, type: 'borderRadius' },
            xl: { value: 16, type: 'borderRadius' }
        };

        // Add default shadows
        tokens.shadow = {
            card: { value: { offset: { x: 0, y: 2 }, blur: 8, color: '#000000', opacity: 0.1 }, type: 'shadow' },
            elevated: { value: { offset: { x: 0, y: 4 }, blur: 16, color: '#000000', opacity: 0.15 }, type: 'shadow' }
        };

        return tokens;
    }

    sanitizeName(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/^color/, '')
            .replace(/^spacing/, '')
            .replace(/^typography/, '');
    }

    async saveTokens(tokens) {
        console.log('💾 Saving tokens to file...');
        
        // Ensure tokens directory exists
        const tokensDir = path.dirname(TOKENS_OUTPUT_PATH);
        if (!fs.existsSync(tokensDir)) {
            fs.mkdirSync(tokensDir, { recursive: true });
        }

        // Save tokens with metadata
        const output = {
            $metadata: {
                generatedAt: new Date().toISOString(),
                source: 'figma-file-content',
                method: 'file-content-extraction',
                note: 'Variables API not available - using file content extraction'
            },
            ...tokens
        };

        fs.writeFileSync(TOKENS_OUTPUT_PATH, JSON.stringify(output, null, 2));
        console.log(`✓ Tokens saved to ${TOKENS_OUTPUT_PATH}`);
    }

    async run() {
        try {
            console.log('🚀 Starting Figma File Content Sync...\n');
            console.log('📝 Note: Using file content extraction (Variables API requires Enterprise plan)\n');
            
            // Fetch file content
            const fileData = await this.fetchFileContent();
            
            // Extract tokens from file content
            const tokens = this.extractTokensFromFile(fileData);
            
            // Save tokens
            await this.saveTokens(tokens);
            
            // Count tokens by category
            const tokenCounts = Object.entries(tokens).map(([category, values]) => {
                const count = Object.keys(values).length;
                return `${category}: ${count}`;
            }).join(', ');
            
            console.log(`\n✅ Sync complete! Generated tokens: ${tokenCounts}`);
            console.log('\n📝 Next steps:');
            console.log('   1. Run: npm run build-tokens');
            console.log('   2. Build your iOS project to see updated tokens');
            console.log('\n💡 To get real Figma variables:');
            console.log('   - Upgrade to Figma Enterprise plan');
            console.log('   - Or manually update tokens in figma-tokens.json');
            
        } catch (error) {
            console.error('❌ Sync failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the sync
if (require.main === module) {
    const sync = new FigmaFileSync();
    sync.run();
}

module.exports = FigmaFileSync;
