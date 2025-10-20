const StyleDictionary = require('style-dictionary');

/**
 * Style Dictionary Configuration for iOS Design System
 * 
 * This configuration transforms design tokens from Figma into Swift code
 * for use in iOS applications with SwiftUI.
 */

StyleDictionary.registerTransform({
    name: 'swift/color',
    type: 'value',
    matcher: function(token) {
        return token.type === 'color';
    },
    transformer: function(token) {
        const value = token.value;
        
        // Handle hex colors
        if (value.startsWith('#')) {
            return `Color(hex: "${value}")`;
        }
        
        // Handle rgba colors
        if (value.startsWith('rgba')) {
            const matches = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            if (matches) {
                const [, r, g, b, a] = matches;
                return `Color(red: ${r}/255, green: ${g}/255, blue: ${b}/255, opacity: ${a})`;
            }
        }
        
        return `Color(hex: "${value}")`;
    }
});

StyleDictionary.registerTransform({
    name: 'swift/font',
    type: 'value',
    matcher: function(token) {
        return token.type === 'typography';
    },
    transformer: function(token) {
        const value = token.value;
        
        if (typeof value === 'object') {
            const { fontSize, fontWeight, lineHeight } = value;
            let fontCode = `Font.system(size: ${fontSize}`;
            
            if (fontWeight) {
                fontCode += `, weight: .${fontWeight.toLowerCase()}`;
            }
            
            fontCode += ')';
            
            if (lineHeight) {
                fontCode += `.lineSpacing(${lineHeight - fontSize})`;
            }
            
            return fontCode;
        }
        
        return `Font.system(size: ${value})`;
    }
});

StyleDictionary.registerTransform({
    name: 'swift/spacing',
    type: 'value',
    matcher: function(token) {
        return token.type === 'spacing';
    },
    transformer: function(token) {
        return `${token.value}`;
    }
});

StyleDictionary.registerTransform({
    name: 'swift/radius',
    type: 'value',
    matcher: function(token) {
        return token.type === 'borderRadius';
    },
    transformer: function(token) {
        return `${token.value}`;
    }
});

StyleDictionary.registerTransform({
    name: 'swift/shadow',
    type: 'value',
    matcher: function(token) {
        return token.type === 'shadow';
    },
    transformer: function(token) {
        if (typeof token.value === 'object') {
            const { offset, blur, color, opacity } = token.value;
            return `Shadow(offset: CGSize(width: ${offset.x}, height: ${offset.y}), blur: ${blur}, color: ${color}, opacity: ${opacity})`;
        }
        return `Shadow(offset: CGSize(width: 0, height: 2), blur: 4, color: .black, opacity: 0.1)`;
    }
});

StyleDictionary.registerTransformGroup({
    name: 'swift',
    transforms: [
        'attribute/cti',
        'name/kebab',
        'swift/color',
        'swift/font',
        'swift/spacing',
        'swift/radius',
        'swift/shadow'
    ]
});

StyleDictionary.registerFormat({
    name: 'swift/colors',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.type === 'color');
        
        let output = `//
//  Colors.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${new Date().toISOString()}
//

import SwiftUI

extension Color {
`;

        tokens.forEach(token => {
            const name = token.name.replace(/-/g, '').replace(/^color/, '');
            const swiftName = name.charAt(0).toLowerCase() + name.slice(1);
            output += `    static let ${swiftName} = ${token.value}\n`;
        });

        output += `}\n`;
        return output;
    }
});

StyleDictionary.registerFormat({
    name: 'swift/typography',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.type === 'typography');
        
        let output = `//
//  Typography.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${new Date().toISOString()}
//

import SwiftUI

extension Font {
`;

        tokens.forEach(token => {
            const name = token.name.replace(/-/g, '').replace(/^typography/, '');
            const swiftName = name.charAt(0).toLowerCase() + name.slice(1);
            output += `    static let ${swiftName} = ${token.value}\n`;
        });

        output += `}\n`;
        return output;
    }
});

StyleDictionary.registerFormat({
    name: 'swift/spacing',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.type === 'spacing');
        
        let output = `//
//  Spacing.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${new Date().toISOString()}
//

import SwiftUI

struct Spacing {
`;

        tokens.forEach(token => {
            const name = token.name.replace(/-/g, '').replace(/^spacing/, '');
            const swiftName = name.charAt(0).toLowerCase() + name.slice(1);
            output += `    static let ${swiftName}: CGFloat = ${token.value}\n`;
        });

        output += `}\n`;
        return output;
    }
});

StyleDictionary.registerFormat({
    name: 'swift/border-radius',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.type === 'borderRadius');
        
        let output = `//
//  BorderRadius.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${new Date().toISOString()}
//

import SwiftUI

struct BorderRadius {
`;

        tokens.forEach(token => {
            const name = token.name.replace(/-/g, '').replace(/^borderradius/, '');
            const swiftName = name.charAt(0).toLowerCase() + name.slice(1);
            output += `    static let ${swiftName}: CGFloat = ${token.value}\n`;
        });

        output += `}\n`;
        return output;
    }
});

StyleDictionary.registerFormat({
    name: 'swift/shadows',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.type === 'shadow');
        
        let output = `//
//  Shadows.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: ${new Date().toISOString()}
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

        tokens.forEach(token => {
            const name = token.name.replace(/-/g, '').replace(/^shadow/, '');
            const swiftName = name.charAt(0).toLowerCase() + name.slice(1);
            output += `    static let ${swiftName} = ${token.value}\n`;
        });

        output += `}\n`;
        return output;
    }
});

// Main configuration
const config = {
    source: ['tokens/figma-tokens.json'],
    platforms: {
        ios: {
            transformGroup: 'swift',
            buildPath: '../DesignSystem/Tokens/',
            files: [
                {
                    destination: 'Colors.swift',
                    format: 'swift/colors',
                    filter: 'color'
                },
                {
                    destination: 'Typography.swift',
                    format: 'swift/typography',
                    filter: 'typography'
                },
                {
                    destination: 'Spacing.swift',
                    format: 'swift/spacing',
                    filter: 'spacing'
                },
                {
                    destination: 'BorderRadius.swift',
                    format: 'swift/border-radius',
                    filter: 'borderRadius'
                },
                {
                    destination: 'Shadows.swift',
                    format: 'swift/shadows',
                    filter: 'shadow'
                }
            ]
        }
    }
};

module.exports = config;
