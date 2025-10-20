#!/usr/bin/env node

/**
 * Figma Variables Sync Script
 * 
 * This script fetches variables from Figma and transforms them
 * into Style Dictionary format for iOS design tokens.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const FIGMA_API_BASE = 'https://api.figma.com/v1';
const TOKENS_OUTPUT_PATH = path.join(__dirname, '../tokens/figma-tokens.json');

class FigmaSync {
    constructor() {
        this.accessToken = process.env.FIGMA_ACCESS_TOKEN;
        this.fileKey = process.env.FIGMA_FILE_KEY;
        this.collections = process.env.FIGMA_COLLECTIONS?.split(',').map(s => s.trim()).filter(Boolean) || [];
        this.modes = process.env.FIGMA_MODES?.split(',').map(s => s.trim()).filter(Boolean) || [];
        
        if (!this.accessToken || !this.fileKey) {
            console.error('❌ Missing required environment variables:');
            console.error('   FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY must be set in .env file');
            process.exit(1);
        }
    }

    async fetchVariables() {
        console.log('🔄 Fetching variables from Figma...');
        
        try {
            const response = await axios.get(
                `${FIGMA_API_BASE}/files/${this.fileKey}/variables/local`,
                {
                    headers: {
                        'X-Figma-Token': this.accessToken
                    }
                }
            );

            const { meta, values } = response.data;
            
            console.log(`✓ Found ${Object.keys(values).length} variables`);
            console.log(`✓ Found ${Object.keys(meta.variableCollections).length} collections`);
            
            return { meta, values };
        } catch (error) {
            console.error('❌ Failed to fetch variables from Figma:', error.response?.data || error.message);
            process.exit(1);
        }
    }

    transformToStyleDictionary({ meta, values }) {
        console.log('🔄 Transforming to Style Dictionary format...');
        
        const tokens = {
            color: {},
            typography: {},
            spacing: {},
            borderRadius: {},
            shadow: {},
            opacity: {}
        };

        // Process each variable
        Object.entries(values).forEach(([variableId, variable]) => {
            const collection = meta.variableCollections[variable.collectionId];
            const collectionName = collection.name.toLowerCase().replace(/\s+/g, '-');
            
            // Filter by collections if specified
            if (this.collections.length > 0 && !this.collections.includes(collection.name)) {
                return;
            }

            // Process variable modes
            Object.entries(variable.valuesByMode).forEach(([modeId, value]) => {
                const mode = collection.modes[modeId];
                const modeName = mode.name.toLowerCase().replace(/\s+/g, '-');
                
                // Filter by modes if specified
                if (this.modes.length > 0 && !this.modes.includes(mode.name)) {
                    return;
                }

                // Create token path
                const tokenPath = this.createTokenPath(variable, collection, mode);
                if (!tokenPath) return;

                // Transform value based on variable type
                const transformedValue = this.transformValue(variable.resolvedType, value);
                if (transformedValue === null) return;

                // Set token value
                this.setNestedValue(tokens, tokenPath, transformedValue);
            });
        });

        return tokens;
    }

    createTokenPath(variable, collection, mode) {
        const collectionName = collection.name.toLowerCase().replace(/\s+/g, '-');
        const modeName = mode.name.toLowerCase().replace(/\s+/g, '-');
        const variableName = variable.name.toLowerCase().replace(/\s+/g, '-');

        // Determine token category based on variable name patterns
        let category = 'spacing';
        if (variable.name.match(/color|background|foreground|border/i)) {
            category = 'color';
        } else if (variable.name.match(/font|text|typography/i)) {
            category = 'typography';
        } else if (variable.name.match(/radius|corner/i)) {
            category = 'borderRadius';
        } else if (variable.name.match(/shadow/i)) {
            category = 'shadow';
        } else if (variable.name.match(/opacity|alpha/i)) {
            category = 'opacity';
        }

        return `${category}.${collectionName}.${modeName}.${variableName}`;
    }

    transformValue(type, value) {
        switch (type) {
            case 'COLOR':
                return this.colorToHex(value);
            case 'FLOAT':
                return parseFloat(value);
            case 'STRING':
                return value;
            case 'BOOLEAN':
                return Boolean(value);
            default:
                console.warn(`⚠️  Unknown variable type: ${type}`);
                return null;
        }
    }

    colorToHex(color) {
        if (!color || typeof color !== 'object') return null;
        
        const { r, g, b, a = 1 } = color;
        const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
        
        if (a < 1) {
            return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        }
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
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
                source: 'figma',
                version: '1.0.0'
            },
            ...tokens
        };

        fs.writeFileSync(TOKENS_OUTPUT_PATH, JSON.stringify(output, null, 2));
        console.log(`✓ Tokens saved to ${TOKENS_OUTPUT_PATH}`);
    }

    async run() {
        try {
            console.log('🚀 Starting Figma Variables Sync...\n');
            
            // Fetch variables from Figma
            const figmaData = await this.fetchVariables();
            
            // Transform to Style Dictionary format
            const tokens = this.transformToStyleDictionary(figmaData);
            
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
            
        } catch (error) {
            console.error('❌ Sync failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the sync
if (require.main === module) {
    const sync = new FigmaSync();
    sync.run();
}

module.exports = FigmaSync;
