/**
 * Contact Form Configuration
 * Contact form specific settings and validation
 */

export const CONTACT_CONFIG = {
  // Contact Form Configuration
  contactForm: {
    title: "Contact Us",
    submitButtonText: "Send Message 🚀",
    responseTimeMessage: "We'll get back to you within 24 hours",
    
    // Available service types in the dropdown
    serviceTypes: [
      "Auto & Home Systems Repair",
      "Logistics & Adaptive Operations",
      "AI Tools & Digital Infrastructure",
      "Emergency & Crisis Response",
      "General Inquiry",
      "Partnership Opportunity"
    ],
    
    // Form validation messages
    validation: {
      nameRequired: "Name is required",
      serviceTypeRequired: "Please select a service type", 
      messageRequired: "Message is required",
      emailInvalid: "Please enter a valid email address"
    }
  },

  // Email Configuration
  email: {
    subjectPrefix: "Atlas Divisions Contact", // Will become "Atlas Divisions Contact: [Service Type] - [Name]"
    systemName: "Atlas Divisions Contact System", // Used as sender name
    
    // Email templates
    templates: {
      adminNotification: {
        header: "New Atlas Divisions Contact Form Submission",
        footer: "Solutions That Outlast the Storm - Reply directly to contact the customer."
      }
    }
  },

  // Admin Panel Configuration  
  admin: {
    title: "Admin Panel",
    welcomeMessage: "Contact Form Administration",
    
    // Status options for submissions
    statusOptions: [
      { value: "new", label: "New", color: "#e67e22" },
      { value: "in_progress", label: "In Progress", color: "#3498db" },
      { value: "resolved", label: "Resolved", color: "#27ae60" },
      { value: "cancelled", label: "Cancelled", color: "#e74c3c" }
    ],
    
    // Table column headers
    columns: {
      name: "Name",
      email: "Email", 
      phone: "Phone",
      service: "Service",
      message: "Message",
      status: "Status",
      date: "Date"
    },
    
    // Empty state message
    emptyState: {
      title: "No submissions yet",
      message: "Waiting for the first contact form submission...",
      buttonText: "Test Contact Form"
    }
  },

  // Feature Flags for Contact Form
  contactFeatures: {
    enableEmailNotifications: true,
    enableAdminAuth: true, // Set to false to disable admin email checking
    enableCloudflareAccess: true, // Set to false if not using Cloudflare Access
    enablePhoneField: true,
    enablePriorityField: false // Future feature
  }
};