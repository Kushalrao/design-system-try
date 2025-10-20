#!/usr/bin/env node

/**
 * Direct Swift Token Generator
 * 
 * Generates Swift design token files directly from Figma data
 * when Style Dictionary format doesn't work
 */

const fs = require('fs');
const path = require('path');

const TOKENS_INPUT_PATH = path.join(__dirname, '../tokens/figma-tokens.json');
const OUTPUT_DIR = path.join(__dirname, '../DesignSystem/Tokens');

class SwiftTokenGenerator {
    constructor() {
        this.tokens = this.loadTokens();
    }

    loadTokens() {
        if (!fs.existsSync(TOKENS_INPUT_PATH)) {
            console.error('❌ No tokens file found. Run sync-file first.');
            process.exit(1);
        }

        const data = fs.readFileSync(TOKENS_INPUT_PATH, 'utf8');
        return JSON.parse(data);
    }

    generateColors() {
        const colors = this.tokens.color || {};
        const timestamp = new Date().toISOString();
        
        let output = `//
//  Colors.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${timestamp}
//

import SwiftUI

extension Color {
`;

        Object.entries(colors).forEach(([name, token]) => {
            const swiftName = this.toSwiftName(name);
            const hexValue = token.value.startsWith('#') ? token.value : `#${token.value}`;
            output += `    static let ${swiftName} = Color(hex: "${hexValue}")\n`;
        });

        output += `}\n`;
        return output;
    }

    generateTypography() {
        const typography = this.tokens.typography || {};
        const timestamp = new Date().toISOString();
        
        let output = `//
//  Typography.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${timestamp}
//

import SwiftUI

extension Font {
`;

        Object.entries(typography).forEach(([name, token]) => {
            const swiftName = this.toSwiftName(name);
            
            if (typeof token.value === 'object') {
                const { fontSize, fontWeight, lineHeight } = token.value;
                let fontCode = `Font.system(size: ${fontSize}`;
                
                if (fontWeight) {
                    fontCode += `, weight: .${fontWeight.toLowerCase()}`;
                }
                
                fontCode += ')';
                
                if (lineHeight) {
                    fontCode += `.lineSpacing(${lineHeight - fontSize})`;
                }
                
                output += `    static let ${swiftName} = ${fontCode}\n`;
            } else {
                output += `    static let ${swiftName} = Font.system(size: ${token.value})\n`;
            }
        });

        output += `}\n`;
        return output;
    }

    generateSpacing() {
        const spacing = this.tokens.spacing || {};
        const timestamp = new Date().toISOString();
        
        let output = `//
//  Spacing.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${timestamp}
//

import SwiftUI

struct Spacing {
`;

        Object.entries(spacing).forEach(([name, token]) => {
            const swiftName = this.toSwiftName(name);
            output += `    static let ${swiftName}: CGFloat = ${token.value}\n`;
        });

        output += `}\n`;
        return output;
    }

    generateBorderRadius() {
        const borderRadius = this.tokens.borderRadius || {};
        const timestamp = new Date().toISOString();
        
        let output = `//
//  BorderRadius.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${timestamp}
//

import SwiftUI

struct BorderRadius {
`;

        Object.entries(borderRadius).forEach(([name, token]) => {
            const swiftName = this.toSwiftName(name);
            output += `    static let ${swiftName}: CGFloat = ${token.value}\n`;
        });

        output += `}\n`;
        return output;
    }

    generateShadows() {
        const shadows = this.tokens.shadow || {};
        const timestamp = new Date().toISOString();
        
        let output = `//
//  Shadows.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${timestamp}
//

import SwiftUI

struct Shadow {
    let offset: CGSize
    let blur: CGFloat
    let color: Color
    let opacity: Double
    
    init(offset: CGSize, blur: CGFloat, color: Color, opacity: Double) {
        self.offset = offset
        self.blur = blur
        self.color = color
        self.opacity = opacity
    }
}

extension Shadow {
`;

        Object.entries(shadows).forEach(([name, token]) => {
            const swiftName = this.toSwiftName(name);
            
            if (typeof token.value === 'object') {
                const { offset, blur, color, opacity } = token.value;
                output += `    static let ${swiftName} = Shadow(offset: CGSize(width: ${offset.x}, height: ${offset.y}), blur: ${blur}, color: Color(hex: "${color}"), opacity: ${opacity})\n`;
            } else {
                output += `    static let ${swiftName} = Shadow(offset: CGSize(width: 0, height: 2), blur: 4, color: .black, opacity: 0.1)\n`;
            }
        });

        output += `}\n`;
        return output;
    }

    toSwiftName(name) {
        return name.charAt(0).toLowerCase() + name.slice(1);
    }

    generateAll() {
        console.log('🎨 Generating Swift design token files...');
        
        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Generate all files
        const files = [
            { name: 'Colors.swift', content: this.generateColors() },
            { name: 'Typography.swift', content: this.generateTypography() },
            { name: 'Spacing.swift', content: this.generateSpacing() },
            { name: 'BorderRadius.swift', content: this.generateBorderRadius() },
            { name: 'Shadows.swift', content: this.generateShadows() }
        ];

        files.forEach(({ name, content }) => {
            const filePath = path.join(OUTPUT_DIR, name);
            fs.writeFileSync(filePath, content);
            console.log(`✓ Generated ${name}`);
        });

        console.log('\n✅ Swift token generation complete!');
        console.log('📱 Build your iOS project to see the updated tokens');
    }
}

// Run the generator
if (require.main === module) {
    const generator = new SwiftTokenGenerator();
    generator.generateAll();
}

module.exports = SwiftTokenGenerator;
