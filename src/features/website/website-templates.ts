/**
 * Website Templates
 * Enhanced brand presence templates
 */
import type { CONFIG } from '../../config/index.js'; // Import CONFIG

export async function getHomepageHTML(corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
	// Enhanced Atlas Divisions homepage with improved brand presence
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.seo.title}</title>
    <meta name="description" content="${config.seo.description}">
    <meta name="keywords" content="${config.seo.keywords.join(', ')}">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        :root {
            /* Atlas Divisions Brand Colors */
            --color-bg: ${config.styling.colors.bgPrimary};
            --color-bg-secondary: ${config.styling.colors.bgSecondary};
            --color-text: ${config.styling.colors.textPrimary};
            --color-text-secondary: ${config.styling.colors.textSecondary};
            --color-accent-gold: ${config.styling.colors.accentGold};
            --color-accent-bronze: ${config.styling.colors.accentBronze};
            --color-accent-teal: ${config.styling.colors.accentTeal};
            --emergency-red: ${config.styling.colors.emergencyRed};
            --ocean-blue: ${config.styling.colors.oceanBlue};
            
            /* Typography */
            --font-heading: ${config.styling.fonts.heading};
            --font-body: ${config.styling.fonts.primary};
            
            /* Effects */
            --border-radius: ${config.styling.effects.borderRadius};
            --border-radius-large: ${config.styling.effects.borderRadiusLarge};
            --transition: ${config.styling.effects.transition};
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-body);
            background: var(--color-bg);
            color: var(--color-text);
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* Navigation */
        .nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            height: 70px;
        }
        
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
        }
        
        .nav-brand {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-accent-gold);
            text-decoration: none;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            color: var(--color-text);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .nav-links a:hover {
            color: var(--color-accent-gold);
        }
        
        .nav-contact {
            background: var(--color-accent-teal);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            text-decoration: none;
            font-weight: 600;
            transition: var(--transition);
        }
        
        .nav-contact:hover {
            background: #006666;
            transform: translateY(-2px);
        }
        
        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            color: var(--color-text);
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 7rem 0 4rem;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .hero-container {
            max-width: min(95vw, 1200px);
            margin: 0 auto;
            padding: 0 clamp(1rem, 4vw, 2rem);
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: clamp(2rem, 5vw, 4rem);
            align-items: center;
        }
        
        .hero-content {
            animation: fadeInUp 1s ease-out;
        }
        
        .hero-globe {
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeInUp 1s ease-out 0.3s both;
        }
        
        .company-title {
            font-family: var(--font-heading);
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            color: var(--color-accent-gold);
            margin-bottom: 1rem;
            text-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
        }
        
        .company-tagline {
            font-size: clamp(1.2rem, 2.5vw, 1.5rem);
            color: var(--color-text-secondary);
            margin-bottom: 1rem;
            font-weight: 500;
        }
        
        .company-message {
            font-size: clamp(1.1rem, 2vw, 1.3rem);
            color: var(--color-accent-teal);
            margin-bottom: 2rem;
            font-weight: 600;
        }
        
        .identity-card {
            background: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: var(--border-radius-large);
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .identity-text {
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--color-text);
        }
        
        .cta-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--transition);
            cursor: pointer;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent-gold) 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
        }
        
        .btn-secondary {
            background: transparent;
            color: var(--color-accent-gold);
            border: 2px solid var(--color-accent-gold);
        }
        
        .btn-secondary:hover {
            background: var(--color-accent-gold);
            color: var(--color-bg);
            transform: translateY(-2px);
        }
        
        .email-copy {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--color-accent-gold);
            cursor: pointer;
            transition: var(--transition);
        }
        
        .email-copy:hover {
            color: var(--color-accent-bronze);
        }
        
        /* Globe Container */
        #globe-container {
            width: min(40vw, 500px);
            height: min(40vw, 500px);
            position: relative;
            margin: 0 auto;
            filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.3));
            animation: float 6s ease-in-out infinite;
        }
        
        #globe-container:hover {
            transform: scale(1.05);
        }
        
        /* Services Section */
        .services {
            padding: 6rem 0;
            background: var(--color-bg-secondary);
        }
        
        .services-container {
            max-width: min(95vw, 1200px);
            margin: 0 auto;
            padding: 0 clamp(1rem, 4vw, 2rem);
        }
        
        .section-title {
            font-family: var(--font-heading);
            font-size: clamp(2rem, 4vw, 3rem);
            text-align: center;
            margin-bottom: 3rem;
            color: var(--color-text);
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: clamp(1rem, 3vw, 2rem);
            max-width: min(90vw, 800px);
            margin: 0 auto;
        }
        
        .service-card {
            background: rgba(26, 26, 26, 0.95);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: var(--border-radius-large);
            padding: 2rem;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }
        
        .service-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent-gold) 100%);
        }
        
        .service-card.emergency::before {
            background: var(--emergency-red);
        }
        
        .service-card:hover {
            transform: translateY(-8px);
            border-color: rgba(212, 175, 55, 0.4);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .service-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: block;
        }
        
        .service-title {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--color-text);
        }
        
        .service-focus {
            color: var(--color-accent-gold);
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        .service-features {
            list-style: none;
            margin-bottom: 1.5rem;
        }
        
        .service-features li {
            padding: 0.25rem 0;
            color: var(--color-text-secondary);
            position: relative;
            padding-left: 1.5rem;
        }
        
        .service-features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: var(--color-accent-teal);
            font-weight: bold;
        }
        
        .emergency .service-features li::before {
            color: var(--emergency-red);
        }
        
        /* Contact Section */
        .contact {
            padding: 6rem 0;
            background: var(--color-bg);
        }
        
        .contact-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
        }
        
        .contact-info h2 {
            font-family: var(--font-heading);
            font-size: 2.5rem;
            margin-bottom: 2rem;
            color: var(--color-text);
        }
        
        .contact-methods {
            margin-bottom: 2rem;
        }
        
        .contact-method {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            padding: 1rem;
            background: rgba(26, 26, 26, 0.5);
            border-radius: var(--border-radius);
            transition: var(--transition);
        }
        
        .contact-method:hover {
            background: rgba(26, 26, 26, 0.8);
        }
        
        .contact-form {
            background: rgba(26, 26, 26, 0.95);
            padding: 2rem;
            border-radius: var(--border-radius-large);
            border: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--color-text);
            font-weight: 600;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 1rem;
            border: 2px solid rgba(212, 175, 55, 0.2);
            border-radius: var(--border-radius);
            background: rgba(10, 10, 10, 0.5);
            color: var(--color-text);
            font-family: var(--font-body);
            transition: var(--transition);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--color-accent-gold);
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }
        
        .required {
            color: var(--emergency-red);
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
            .nav-links {
                display: none;
            }
            
            .mobile-menu-toggle {
                display: block;
            }
            
            /* MOBILE HERO: Simple single column layout */
            .hero-container {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
                gap: 2rem !important;
                max-width: 95vw !important;
            }
            
            /* Company TITLE comes first */
            .company-title {
                order: 1 !important;
                margin-bottom: 1rem !important;
            }
            
            /* Globe comes SECOND and is HUGE */
            .hero-globe {
                order: 2 !important;
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                margin: 2rem 0 !important;
            }
            
            /* Rest of content comes THIRD */
            .hero-content {
                order: 3 !important;
                width: 100% !important;
            }
            
            .company-tagline,
            .company-message,
            .identity-card,
            .cta-buttons {
                order: inherit !important;
            }
            
            /* Make globe MASSIVE on mobile */
            #globe-container {
                width: 85vw !important;
                height: 85vw !important;
                max-width: 450px !important;
                max-height: 450px !important;
                min-width: 300px !important;
                min-height: 300px !important;
            }
            
            .contact-container {
                grid-template-columns: 1fr;
            }
            
            .cta-buttons {
                justify-content: center;
            }
            
            .services-grid {
                grid-template-columns: 1fr;
                grid-template-rows: repeat(4, 1fr);
                max-width: min(95vw, 400px);
                gap: clamp(1rem, 4vw, 1.5rem);
            }
        }
        
        @media (max-width: 480px) {
            .nav-container {
                padding: 0 1rem;
            }
            
            .hero {
                padding: 5rem 0 2rem;
            }
            
            .hero-container,
            .services-container,
            .contact-container {
                padding: 0 1rem;
            }
            
            #globe-container {
                width: 200px;
                height: 200px;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="#home" class="nav-brand">${config.company.emoji} ${config.company.name}</a>
            <ul class="nav-links">
                ${config.navigation.mainMenu.map((item: any) => `<li><a href="${item.href}">${item.label}</a></li>`).join('')}
            </ul>
            <a href="${config.navigation.ctaButton.href}" class="nav-contact">${config.navigation.ctaButton.label}</a>
            <button class="mobile-menu-toggle">☰</button>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="hero-container">
            <div class="hero-globe">
                <div id="globe-container"></div>
            </div>
            
            <div class="hero-content">
                <h1 class="company-title">${config.homepage.hero.title}</h1>
                <p class="company-tagline">${config.homepage.hero.tagline}</p>
                <p class="company-message">${config.homepage.hero.message}</p>
                
                <div class="identity-card">
                    <p class="identity-text">
                        ${config.homepage.hero.description}
                    </p>
                </div>
                
                <div class="cta-buttons">
                    <a href="${config.homepage.hero.primaryCta.href}" class="btn btn-primary">
                        ${config.homepage.hero.primaryCta.label}
                    </a>
                    <a href="${config.homepage.hero.secondaryCta.href}" class="btn btn-secondary">
                        ${config.homepage.hero.secondaryCta.label}
                    </a>
                </div>
                
                <div class="cta-buttons">
                    <span class="email-copy" onclick="copyEmail()">
                        📧 ${config.company.primaryEmail}
                        <span id="copy-feedback" style="display: none; color: var(--color-accent-teal);">✓ Copied!</span>
                    </span>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services">
        <div class="services-container">
            <h2 class="section-title">${config.homepage.services.title}</h2>
            <div class="services-grid">
                ${config.homepage.services.items.map((service: any) => `
                    <div class="service-card ${service.isEmergency ? 'emergency' : ''}">
                        <span class="service-icon">${service.icon}</span>
                        <h3 class="service-title">${service.title}</h3>
                        <p class="service-focus">${service.focus}</p>
                        <ul class="service-features">
                            ${service.features.map((feature: any) => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
        <div class="contact-container">
            <div class="contact-info">
                <h2>${config.homepage.contact.title}</h2>
                <div class="contact-methods">
                    ${config.homepage.contact.methods.map((method: any) => `
                        <div class="contact-method">
                            <span>${method.icon}</span>
                            <div>
                                <strong>${method.label}:</strong><br>
                                ${method.action === 'copy' 
                                    ? `<span class="email-copy" onclick="copyEmail()">${method.value}</span>`
                                    : `<span>${method.value}</span>`
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="contact-form">
                <h3>Send a Message</h3>
                <form action="/submit" method="POST">
                    <div class="form-group">
                        <label for="name">Name <span class="required">*</span></label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email">
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="tel" id="phone" name="phone">
                    </div>
                    
                    <div class="form-group">
                        <label for="service_type">Service Type <span class="required">*</span></label>
                        <select id="service_type" name="service_type" required>
                            <option value="">Select a service...</option>
                            ${config.contactForm.serviceTypes.map((type: string) => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Message <span class="required">*</span></label>
                        <textarea id="message" name="message" rows="5" placeholder="Describe how we can help you..." required></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        ${config.contactForm.submitButtonText}
                    </button>
                </form>
            </div>
        </div>
    </section>

    <script type="module" src="/js/homepage.js" defer></script>
</body>
</html>`;

	return new Response(html, {
		headers: { 'Content-Type': 'text/html', ...corsHeaders }
	});
}