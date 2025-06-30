/**
 * Website Configuration
 * Website structure, content, and navigation
 */

export const WEBSITE_CONFIG = {
  // Website Structure
  navigation: {
    mainMenu: [
      { label: "Home", href: "#home", active: true },
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Contact", href: "#contact" }
    ],
    ctaButton: {
      label: "Get in Touch",
      href: "#contact"
    }
  },

  // Homepage Content
  homepage: {
    hero: {
      title: "Atlas Divisions",
      tagline: "Solutions That Outlast the Storm",
      message: "Mapping Chaos. Building Resilience.",
      description: "Founded by <strong>Captain Harley Miller</strong>, Atlas Divisions delivers no-nonsense, transparent solutions across multiple domains. We specialize in adaptive response, crisis management, and building systems that endure. Our military-influenced precision meets practical problem-solving to create solutions that truly outlast the storm.",
      primaryCta: {
        label: "Explore Services",
        href: "#services"
      },
      secondaryCta: {
        label: "Start Project",
        href: "#contact"
      }
    },
    
    services: {
      title: "Our Services",
      items: [
        {
          id: "auto-home-repair",
          icon: "🔧",
          title: "Auto & Home Systems Repair",
          focus: "Practical, reliable repairs",
          features: [
            "Transparent pricing",
            "Emergency availability",
            "Maintenance planning",
            "No-nonsense diagnostics"
          ]
        },
        {
          id: "logistics-operations",
          icon: "📊",
          title: "Logistics & Adaptive Operations",
          focus: "Streamlined operations for businesses",
          features: [
            "Tailored solutions",
            "Crisis response",
            "Efficiency audits",
            "Scalable design"
          ]
        },
        {
          id: "ai-digital",
          icon: "🤖",
          title: "AI Tools & Digital Infrastructure",
          focus: "Transparent AI integration",
          features: [
            "Ethical implementation",
            "Custom automation",
            "Infrastructure setup",
            "Training & documentation"
          ]
        },
        {
          id: "emergency-response",
          icon: "🚨",
          title: "Emergency & Crisis Response",
          focus: "24/7 urgent situation response",
          features: [
            "Emergency availability",
            "Rapid assessment",
            "Multi-domain management",
            "Clear communication"
          ],
          isEmergency: true
        }
      ]
    },

    contact: {
      title: "Get in Touch",
      methods: [
        {
          icon: "📧",
          label: "Email",
          value: "harley@atlasdivisions.com",
          action: "copy"
        },
        {
          icon: "⚡",
          label: "Response Time", 
          value: "Within 24 hours"
        },
        {
          icon: "🌐",
          label: "Domain",
          value: "atlasdivisions.com"
        }
      ]
    }
  },

  // SEO and Meta
  seo: {
    title: "Atlas Divisions - Solutions That Outlast the Storm",
    description: "Atlas Divisions - Mapping Chaos, Building Resilience. Professional services in auto repair, logistics, AI tools, and emergency response.",
    keywords: ["Atlas Divisions", "Captain Harley Miller", "crisis management", "adaptive solutions", "emergency response", "logistics", "AI tools", "auto repair"]
  },

  // Feature Flags for Website
  websiteFeatures: {
    enableAnalytics: true,
    enableThreeJsGlobe: true,
    enableServiceDetails: true,
    enableAboutPage: false // Future feature
  }
};