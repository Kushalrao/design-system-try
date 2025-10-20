//
//  Shadows.swift
//  Design System
//
//  ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
//  Generated from Figma Variables via Style Dictionary
//  Last updated: 2025-10-19T13:06:59.013Z
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
    static let card = Shadow(offset: CGSize(width: 0, height: 2), blur: 8, color: Color(hex: "#000000"), opacity: 0.1)
    static let elevated = Shadow(offset: CGSize(width: 0, height: 4), blur: 16, color: Color(hex: "#000000"), opacity: 0.15)
}
