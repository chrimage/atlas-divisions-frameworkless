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

## Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd atlas-divisions-rebuild
   npm install
   ```

2. **Configure Cloudflare Workers account:**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **Set up environment configuration:**
   ```bash
   # Copy template configuration files
   cp wrangler.example.jsonc wrangler.jsonc
   cp .env.example .env
   
   # Update with your actual values
   # NEVER commit these files to the repository
   ```

4. **Create D1 database and apply schema:**
   ```bash
   wrangler d1 create atlas-divisions-contact-db
   wrangler d1 execute atlas-divisions-contact-db --file=schema.sql
   ```

5. **Deploy:**
   ```bash
   npm run deploy
   ```

See [SETUP.md](SETUP.md) for detailed instructions and [SECURITY.md](SECURITY.md) for comprehensive security guidelines.

## 🔐 Security Notes

**IMPORTANT:** This repository follows security best practices:

- ✅ Production credentials are **never committed** to the repository
- ✅ Template files (`wrangler.example.jsonc`, `.env.example`) show the required format
- ✅ Actual configuration files (`wrangler.jsonc`, `.env`) are gitignored
- ✅ Admin access is secured via Cloudflare Access or email verification

**Files that contain secrets and should NOT be committed:**
- `wrangler.jsonc` (contains account IDs, database IDs)
- `.env` (contains API keys and credentials)
- Any `wrangler.*.jsonc` files with actual values

## License

MIT License