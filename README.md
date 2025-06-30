# Atlas Divisions - Modular Website & Contact System

A professional website with modular architecture featuring brand presence and contact form functionality, built on Cloudflare Workers.

## About

This project provides a complete solution for the Atlas Divisions brand with a clean separation between website features and contact form functionality. It includes:

- **Modular Architecture**: Feature-based routing with separated concerns
- **Brand Website**: Professional landing page with Three.js globe visualization
- **Contact System**: Comprehensive contact form with admin management
- **Responsive Design**: Mobile-first dark theme with Atlas brand colors
- **Admin Dashboard**: Complete submission management system

## Brand Details

- **Company**: Atlas Divisions
- **Founder**: Captain Harley Miller  
- **Email**: harley@atlasdivisions.com
- **Tagline**: "Solutions That Outlast the Storm"
- **Core Message**: "Mapping Chaos. Building Resilience."

## Technology Stack

- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Email**: Cloudflare Email Routing
- **3D Graphics**: Three.js v0.177.0
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Project Structure

```
├── src/
│   ├── index.ts                    # Main Worker entry point
│   ├── config/                     # Modular configuration
│   │   ├── index.ts               # Combined config with environment support
│   │   ├── brand.ts               # Atlas Divisions brand identity
│   │   ├── contact.ts             # Contact form configuration
│   │   ├── website.ts             # Website structure & content
│   │   └── security.ts            # Security & CORS settings
│   ├── features/                   # Feature-based modules
│   │   ├── contact/               # Contact form feature
│   │   │   ├── contact-routes.ts  # Contact form routes & handlers
│   │   │   └── contact-templates.ts # Contact form templates
│   │   └── website/               # Website feature
│   │       ├── website-routes.ts  # Website routes & handlers
│   │       └── website-templates.ts # Homepage & brand templates
│   ├── templates/                  # Shared templates (success, error, admin)
│   ├── utils/                      # Shared utilities
│   ├── styles/                     # Theme generation
│   └── types/                      # TypeScript types
├── docs/                           # Documentation
├── test/                           # Tests
├── schema.sql                     # Database schema
└── wrangler.example.jsonc         # Example Cloudflare config
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Deploy to Cloudflare
npm run deploy
```

## Architecture

### Modular Design
The application uses a **feature-based architecture** that separates concerns:

- **Website Feature**: Homepage, brand presence, and general site functionality
- **Contact Feature**: Contact form, submission handling, and admin management
- **Shared Configuration**: Modular configuration system with environment overrides
- **Shared Utilities**: Database, email, authentication, and validation utilities

### Route Structure
- `/` - Homepage (enhanced brand presence)
- `/contact` - Contact form (primary feature) 
- `/submit` - Form submission endpoint
- `/admin` - Admin dashboard
- `/admin/update` - Status update endpoint

### Benefits
✅ **Separation of Concerns** - Contact form is a distinct, self-contained feature  
✅ **Scalable Architecture** - Easy to add new features without touching existing code  
✅ **Maintainable Codebase** - Clear boundaries between website and contact functionality  
✅ **Enhanced Brand Presence** - Website can grow as a comprehensive brand platform  
✅ **Contact Form as Primary Feature** - Prominent placement with dedicated endpoints

## Features

### Enhanced Brand Website
- Professional homepage with Atlas Divisions identity
- Interactive Three.js globe visualization
- Service showcase with emergency response highlighting
- Mobile-responsive design with Atlas color scheme

### Comprehensive Contact System
- Dedicated contact form with validation
- Email notifications via Mailgun/Cloudflare
- Admin dashboard for managing submissions
- CSRF protection and secure authentication

### Three.js Globe
- Interactive world map visualization
- Auto-rotation with mouse interaction
- Responsive sizing for different screen sizes
- Fallback for failed data loading

### Services
1. Auto & Home Systems Repair
2. Logistics & Adaptive Operations  
3. AI Tools & Digital Infrastructure
4. Emergency & Crisis Response

## Design System

Based on the design specification, the site uses:
- Dark theme with gold accents (#d4af37)
- Montserrat and Inter fonts
- Responsive grid layouts
- Glass-morphism effects

## Setup & Deployment

Setting up and deploying this project involves configuring Cloudflare services (Workers, D1) and managing application secrets securely. We've streamlined this process to be as straightforward and secure as possible.

**Key Principles of the New Setup:**
- **Secure Secret Management:** Production secrets (API keys, sensitive IDs) are managed using `wrangler secret put`.
- **Local Development Ease:** Local secrets are managed via a `.dev.vars` file (which is gitignored).
- **Clear Environment Separation:** Distinct steps and configurations for local development versus production.

**Quick Steps:**

1.  **Clone and Install Dependencies:**
    ```bash
    git clone <repository-url>
    cd <repository-directory> # e.g., atlas-divisions-rebuild
    npm install
    npm install -g wrangler # If not already installed
    ```

2.  **Initial Cloudflare Login & Setup:**
    ```bash
    wrangler login
    # Follow instructions in SETUP.md for initial Cloudflare Account ID setup
    ```

3.  **Detailed Configuration & Deployment:**
    For comprehensive instructions on setting up your local environment, D1 databases, Mailgun, production secrets, and deploying, please refer to the **[SETUP.md](SETUP.md)** guide. It covers:
    - Local development server (`npm run dev`)
    - Production deployment (`npm run deploy`)
    - Database schema migration
    - Configuring Cloudflare Access for the admin panel

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for verifying your production deployment after following `SETUP.md`.
See [SECURITY.md](SECURITY.MD) for broader security considerations.

## 🔐 Simplified & Secure Configuration

This project emphasizes security and ease of maintenance:

- ✅ **Production secrets are managed via `wrangler secret put`**, never directly in `wrangler.jsonc` or committed to Git.
- ✅ **Local development uses `.dev.vars`** for easy secret management without risk of committing them.
- ✅ `wrangler.example.jsonc` serves as a template, guiding towards secure practices.
- ✅ `wrangler.jsonc` (if used for anything beyond basic structure) and `.dev.vars` are included in `.gitignore`.
- ✅ Admin access is secured (Cloudflare Access recommended).

**Files containing secrets that MUST NOT be committed:**
- Your actual `wrangler.jsonc` if you ever put temporary secrets in it for local testing (prefer `.dev.vars`).
- Your `.dev.vars` file.
- Any `.env` files if you choose to use them for local shell environment variables (though `SETUP.md` guides away from this for worker variables).

## License

MIT License