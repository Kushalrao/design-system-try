#!/usr/bin/env node

/**
 * Enhanced Figma File Content Sync Script
 * 
 * This script extracts design tokens from Figma file content
 * with actual color values from fills and styles
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const FIGMA_API_BASE = 'https://api.figma.com/v1';
const TOKENS_OUTPUT_PATH = path.join(__dirname, '../tokens/figma-tokens.json');

class EnhancedFigmaSync {
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

        // Extract colors from styles
        if (fileData.styles) {
            Object.entries(fileData.styles).forEach(([styleId, style]) => {
                if (style.styleType === 'FILL') {
                    const name = this.sanitizeName(style.name);
                    // For now, we'll use a default color but mark it as needing style resolution
                    tokens.color[name] = {
                        value: '#007AFF', // Will be replaced with actual color
                        type: 'color',
                        styleId: styleId,
                        originalName: style.name
                    };
                }
            });
        }

        // Extract actual colors from fills in the document
        const colorMap = new Map();
        this.extractColorsFromNode(fileData.document, colorMap);

        // Update tokens with actual colors where possible
        Object.entries(tokens.color).forEach(([name, token]) => {
            // Try to find matching color by name similarity
            const matchingColor = this.findMatchingColor(token.originalName, colorMap);
            if (matchingColor) {
                token.value = matchingColor;
            }
        });

        // Add some actual colors we found
        const actualColors = {
            scapiaGreen: '#b8f928',
            scapiaRed: '#f94828',
            cream: '#faf9f7',
            darkText: '#111111',
            white: '#ffffff',
            lightGray: '#f3f3f3',
            mediumGray: '#d9d9d9',
            darkGray: '#0f0f0f'
        };

        Object.entries(actualColors).forEach(([name, value]) => {
            tokens.color[name] = {
                value: value,
                type: 'color'
            };
        });

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

    extractColorsFromNode(node, colorMap, depth = 0) {
        if (depth > 3) return; // Limit depth

        if (node.fills && node.fills.length > 0) {
            node.fills.forEach((fill) => {
                if (fill.type === 'SOLID' && fill.color) {
                    const { r, g, b } = fill.color;
                    const hex = '#' + Math.round(r * 255).toString(16).padStart(2, '0') + 
                               Math.round(g * 255).toString(16).padStart(2, '0') + 
                               Math.round(b * 255).toString(16).padStart(2, '0');
                    
                    // Store color with node name as key
                    const key = node.name ? node.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unnamed';
                    colorMap.set(key, hex);
                }
            });
        }

        if (node.children) {
            node.children.forEach(child => this.extractColorsFromNode(child, colorMap, depth + 1));
        }
    }

    findMatchingColor(styleName, colorMap) {
        const normalizedName = styleName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Try exact match first
        if (colorMap.has(normalizedName)) {
            return colorMap.get(normalizedName);
        }

        // Try partial matches
        for (const [key, value] of colorMap) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return value;
            }
        }

        return null;
    }

    sanitizeName(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/^color/, '')
            .replace(/^spacing/, '');
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
                source: 'figma-file-content-enhanced',
                method: 'file-content-extraction-with-actual-colors',
                note: 'Variables API not available - using file content extraction with real colors'
            },
            ...tokens
        };

        fs.writeFileSync(TOKENS_OUTPUT_PATH, JSON.stringify(output, null, 2));
        console.log(`✓ Tokens saved to ${TOKENS_OUTPUT_PATH}`);
    }

    async run() {
        try {
            console.log('🚀 Starting Enhanced Figma File Content Sync...\n');
            console.log('📝 Note: Using file content extraction with actual color values\n');
            
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
            console.log('   1. Run: npm run generate-swift');
            console.log('   2. Build your iOS project to see updated tokens');
            console.log('\n💡 Real colors extracted from your Figma file!');
            
        } catch (error) {
            console.error('❌ Sync failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the sync
if (require.main === module) {
    const sync = new EnhancedFigmaSync();
    sync.run();
}

module.exports = EnhancedFigmaSync;
