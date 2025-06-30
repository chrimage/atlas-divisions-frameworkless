/**
 * Atlas Divisions Brand Configuration
 * Core brand identity and styling
 */

export const BRAND_CONFIG = {
  // Company/Organization Information
  company: {
    name: "Atlas Divisions", 
    tagline: "Solutions That Outlast the Storm",
    coreMessage: "Mapping Chaos. Building Resilience.",
    founder: "Captain Harley Miller",
    primaryEmail: "harley@atlasdivisions.com",
    shortName: "Atlas Divisions", // Used in email subjects
    emoji: "🌍", // Used throughout the UI
  },

  // UI Styling Configuration
  styling: {
    // Atlas Divisions Teal-Gold color scheme
    colors: {
      // Primary Colors (matching design spec)
      bgPrimary: "#0a0a0a", // Primary background
      bgSecondary: "#1a1a1a", // Secondary background
      textPrimary: "#ffffff", // Primary text
      textSecondary: "#b8b8b8", // Secondary text
      
      // Brand Accent Colors
      accentGold: "#d4af37", // Primary brand color
      accentBronze: "#cd7f32", // Secondary brand color
      accentTeal: "#008080", // Tertiary accent
      
      // Functional Colors
      emergencyRed: "#dc143c", // Emergency service highlighting
      oceanBlue: "#001122", // Globe ocean color
      
      // Teal palette (dominant)
      primary: "#008080", // Atlas teal
      primaryHover: "#006666", // Darker teal for hover
      primaryLight: "#20b2aa", // Lighter teal
      primaryBg: "#004d4d", // Very dark teal for backgrounds
      
      // Gold palette (accent)
      accent: "#d4af37", // Atlas gold
      accentHover: "#b8941f", // Darker gold hover
      accentLight: "#e6c967", // Light gold
      accentDark: "#cd7f32", // Atlas bronze
      
      // Status colors with teal-gold theme
      success: "#059669", // Emerald green (teal family)
      successHover: "#047857",
      error: "#dc2626", // Red
      errorBg: "#fef2f2",
      warning: "#d97706", // Amber (gold family)
      warningBg: "#fffbeb",
      
      // Text colors (Atlas dark theme)
      text: "#ffffff", // White text for dark theme
      textLight: "#b8b8b8", // Light gray text
      textInverse: "#0a0a0a", // Dark text for light backgrounds
      
      // Background colors (Atlas dark theme)
      background: "#0a0a0a", // Primary dark background
      backgroundSecondary: "#1a1a1a", // Secondary dark background
      backgroundDark: "#000000", // Pure black background
      
      // Surface colors (Atlas dark theme)
      surface: "rgba(26, 26, 26, 0.95)", // Dark translucent surface
      surfaceTeal: "rgba(0, 128, 128, 0.1)", // Dark teal surface
      surfaceGold: "rgba(212, 175, 55, 0.1)", // Dark gold surface
      
      // Border colors (Atlas dark theme)
      border: "rgba(212, 175, 55, 0.2)", // Gold border with opacity
      borderTeal: "rgba(0, 128, 128, 0.3)", // Teal border with opacity
      borderGold: "rgba(212, 175, 55, 0.4)", // Brighter gold border
      
      // Gradients (Atlas theme)
      gradientPrimary: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", // Dark gradient
      gradientAccent: "linear-gradient(135deg, #d4af37 0%, #cd7f32 100%)", // Gold to bronze
      gradientDark: "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)", // Pure dark gradient
      gradientTealGold: "linear-gradient(135deg, #008080 0%, #d4af37 100%)", // Atlas teal to gold
      
      // Shadow colors (Atlas theme)
      shadowTeal: "rgba(0, 128, 128, 0.3)",
      shadowGold: "rgba(212, 175, 55, 0.3)",
      shadowDark: "rgba(0, 0, 0, 0.5)"
    },
    
    // Typography (matching design spec)
    fonts: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      heading: "'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    
    // Visual effects
    effects: {
      borderRadius: "8px",
      borderRadiusLarge: "12px",
      borderRadiusSmall: "4px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      boxShadowLarge: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: "all 0.2s ease-in-out"
    }
  }
};