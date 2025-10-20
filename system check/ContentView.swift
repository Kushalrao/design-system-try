//
//  ContentView.swift
//  system check
//
//  Created by Kushal on 16/10/25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.large) {
                // Header Section
                VStack(spacing: Spacing.medium) {
                    Image(systemName: "paintbrush.pointed")
                        .imageScale(.large)
                        .foregroundColor(.primary)
                        .font(.system(size: 32))
                    
                    Text("Design System Demo")
                        .font(.headline)
                        .foregroundColor(.text)
                    
                    Text("iOS Design System with Figma Sync")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, Spacing.xl)
                
                // Color Palette
                VStack(alignment: .leading, spacing: Spacing.medium) {
                    Text("Colors")
                        .font(.title)
                        .foregroundColor(.text)
                    
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: Spacing.medium) {
                        ColorCard(name: "Primary", color: .primary)
                        ColorCard(name: "Secondary", color: .secondary)
                        ColorCard(name: "Success", color: .success)
                        ColorCard(name: "Warning", color: .warning)
                        ColorCard(name: "Error", color: .error)
                        ColorCard(name: "Surface", color: .surface)
                    }
                }
                .padding(.horizontal, Spacing.medium)
                
                // Typography
                VStack(alignment: .leading, spacing: Spacing.medium) {
                    Text("Typography")
                        .font(.title)
                        .foregroundColor(.text)
                    
                    VStack(alignment: .leading, spacing: Spacing.small) {
                        Text("Headline")
                            .font(.headline)
                        Text("Title")
                            .font(.title)
                        Text("Body text")
                            .font(.body)
                        Text("Caption text")
                            .font(.caption)
                    }
                    .foregroundColor(.text)
                }
                .padding(.horizontal, Spacing.medium)
                
                // Spacing Demo
                VStack(alignment: .leading, spacing: Spacing.medium) {
                    Text("Spacing")
                        .font(.title)
                        .foregroundColor(.text)
                    
                    VStack(spacing: Spacing.small) {
                        SpacingBar(size: .xs, name: "XS")
                        SpacingBar(size: .small, name: "Small")
                        SpacingBar(size: .medium, name: "Medium")
                        SpacingBar(size: .large, name: "Large")
                        SpacingBar(size: .xl, name: "XL")
                    }
                }
                .padding(.horizontal, Spacing.medium)
                
                // Border Radius Demo
                VStack(alignment: .leading, spacing: Spacing.medium) {
                    Text("Border Radius")
                        .font(.title)
                        .foregroundColor(.text)
                    
                    HStack(spacing: Spacing.medium) {
                        RadiusCard(radius: .small, name: "Small")
                        RadiusCard(radius: .medium, name: "Medium")
                        RadiusCard(radius: .large, name: "Large")
                        RadiusCard(radius: .xl, name: "XL")
                    }
                }
                .padding(.horizontal, Spacing.medium)
                
                // Shadow Demo
                VStack(alignment: .leading, spacing: Spacing.medium) {
                    Text("Shadows")
                        .font(.title)
                        .foregroundColor(.text)
                    
                    HStack(spacing: Spacing.large) {
                        ShadowCard(shadow: .card, name: "Card")
                        ShadowCard(shadow: .elevated, name: "Elevated")
                    }
                }
                .padding(.horizontal, Spacing.medium)
                .padding(.bottom, Spacing.xl)
            }
        }
        .background(Color.background)
    }
}

struct ColorCard: View {
    let name: String
    let color: Color
    
    var body: some View {
        VStack(spacing: Spacing.small) {
            RoundedRectangle(cornerRadius: BorderRadius.medium)
                .fill(color)
                .frame(height: 60)
            
            Text(name)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
    }
}

struct SpacingBar: View {
    let size: CGFloat
    let name: String
    
    var body: some View {
        HStack {
            Text(name)
                .font(.caption)
                .foregroundColor(.textSecondary)
                .frame(width: 60, alignment: .leading)
            
            Rectangle()
                .fill(Color.primary)
                .frame(width: size, height: 8)
                .cornerRadius(BorderRadius.small)
            
            Spacer()
        }
    }
}

struct RadiusCard: View {
    let radius: CGFloat
    let name: String
    
    var body: some View {
        VStack(spacing: Spacing.small) {
            RoundedRectangle(cornerRadius: radius)
                .fill(Color.primary)
                .frame(width: 60, height: 60)
            
            Text(name)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
    }
}

struct ShadowCard: View {
    let shadow: Shadow
    let name: String
    
    var body: some View {
        VStack(spacing: Spacing.small) {
            RoundedRectangle(cornerRadius: BorderRadius.medium)
                .fill(Color.surface)
                .frame(width: 80, height: 80)
                .shadow(
                    color: shadow.color.opacity(shadow.opacity),
                    radius: shadow.blur,
                    x: shadow.offset.width,
                    y: shadow.offset.height
                )
            
            Text(name)
                .font(.caption)
                .foregroundColor(.textSecondary)
        }
    }
}

#Preview {
    ContentView()
}
