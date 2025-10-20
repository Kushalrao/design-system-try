//
//  DesignSystem.swift
//  Design System
//
//  Main interface for the iOS Design System
//  Provides easy access to all design tokens and components
//

import SwiftUI

/**
 * DesignSystem
 * 
 * Main interface for accessing design tokens and components.
 * This is the primary entry point for using the design system in your app.
 */
public struct DesignSystem {
    
    // MARK: - Colors
    public struct Colors {
        // Colors will be auto-generated from Figma variables
        // See DesignSystem/Tokens/Colors.swift
    }
    
    // MARK: - Typography
    public struct Typography {
        // Typography will be auto-generated from Figma variables
        // See DesignSystem/Tokens/Typography.swift
    }
    
    // MARK: - Spacing
    public struct Spacing {
        // Spacing will be auto-generated from Figma variables
        // See DesignSystem/Tokens/Spacing.swift
    }
    
    // MARK: - Border Radius
    public struct BorderRadius {
        // Border radius will be auto-generated from Figma variables
        // See DesignSystem/Tokens/BorderRadius.swift
    }
    
    // MARK: - Shadows
    public struct Shadows {
        // Shadows will be auto-generated from Figma variables
        // See DesignSystem/Tokens/Shadows.swift
    }
    
    // MARK: - Components
    public struct Components {
        // Future custom components will be added here
        // See DesignSystem/Components/ directory
    }
}

// MARK: - Convenience Extensions

extension DesignSystem {
    /// Quick access to colors
    public static var colors: Colors.Type { Colors.self }
    
    /// Quick access to typography
    public static var typography: Typography.Type { Typography.self }
    
    /// Quick access to spacing
    public static var spacing: Spacing.Type { Spacing.self }
    
    /// Quick access to border radius
    public static var borderRadius: BorderRadius.Type { BorderRadius.self }
    
    /// Quick access to shadows
    public static var shadows: Shadows.Type { Shadows.self }
    
    /// Quick access to components
    public static var components: Components.Type { Components.self }
}

// MARK: - Usage Examples
/*
 
 Usage in SwiftUI:
 
 Text("Hello World")
     .foregroundColor(.primary)           // From Colors.swift
     .font(.headline)                     // From Typography.swift
     .padding(.medium)                    // From Spacing.swift
     .background(Color.secondary)
     .cornerRadius(.small)                // From BorderRadius.swift
     .shadow(shadow: .card)               // From Shadows.swift
 
 Or using the DesignSystem namespace:
 
 Text("Hello World")
     .foregroundColor(DesignSystem.colors.primary)
     .font(DesignSystem.typography.headline)
     .padding(DesignSystem.spacing.medium)
 
 */
