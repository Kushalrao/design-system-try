const StyleDictionary = require('style-dictionary');

/**
 * Style Dictionary Configuration for iOS Design System
 * Using built-in filters and custom formats
 */

// Register custom formats
StyleDictionary.registerFormat({
    name: 'ios/colors',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.attributes.category === 'color');
        
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
            const hexValue = token.value.startsWith('#') ? token.value : `#${token.value}`;
            output += `    static let ${swiftName} = Color(hex: "${hexValue}")\n`;
        });

        output += `}\n`;
        return output;
    }
});

StyleDictionary.registerFormat({
    name: 'ios/spacing',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.attributes.category === 'spacing');
        
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
    name: 'ios/border-radius',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.attributes.category === 'borderRadius');
        
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
    name: 'ios/typography',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.attributes.category === 'typography');
        
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
});

StyleDictionary.registerFormat({
    name: 'ios/shadows',
    formatter: function(dictionary, file) {
        const tokens = dictionary.allTokens.filter(token => token.attributes.category === 'shadow');
        
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
});

// Main configuration
const config = {
    source: ['../tokens/figma-tokens.json'],
    platforms: {
        ios: {
            buildPath: '../DesignSystem/Tokens/',
            files: [
                {
                    destination: 'Colors.swift',
                    format: 'ios/colors',
                    filter: function(token) {
                        return token.attributes.category === 'color';
                    }
                },
                {
                    destination: 'Typography.swift',
                    format: 'ios/typography',
                    filter: function(token) {
                        return token.attributes.category === 'typography';
                    }
                },
                {
                    destination: 'Spacing.swift',
                    format: 'ios/spacing',
                    filter: function(token) {
                        return token.attributes.category === 'spacing';
                    }
                },
                {
                    destination: 'BorderRadius.swift',
                    format: 'ios/border-radius',
                    filter: function(token) {
                        return token.attributes.category === 'borderRadius';
                    }
                },
                {
                    destination: 'Shadows.swift',
                    format: 'ios/shadows',
                    filter: function(token) {
                        return token.attributes.category === 'shadow';
                    }
                }
            ]
        }
    }
};

module.exports = config;