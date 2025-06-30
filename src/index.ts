/**
 * Atlas Divisions Website & Contact System 🌍
 * Modular architecture with feature-based routing
 *
 * Features:
 * - Website: Brand presence and homepage
 * - Contact: Contact form and admin management
 */

import { getConfig, validateConfig } from "./config/index.js";

// Import types
import type { Env } from './types/index.js';

// Import utilities
import { getCorsHeaders, handlePreflightRequest, createErrorResponse } from './utils/cors.js';

// Import feature modules
import { ContactRoutes } from './features/contact/contact-routes.js';
import { WebsiteRoutes } from './features/website/website-routes.js';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		// Pass the full env object to getConfig to access environment variables
		const config = getConfig(env.ENVIRONMENT, env);
		
		// Validate configuration on startup
		// Pass env to validateConfig as well, as it might need to check raw env vars
		const configErrors = validateConfig(config, env);
		if (configErrors.length > 0) {
			console.warn('Configuration warnings:', configErrors);
		}
		
		// Get CORS headers
		const corsHeaders = getCorsHeaders(config);

		// Handle preflight requests
		if (request.method === 'OPTIONS') {
			return handlePreflightRequest(corsHeaders);
		}

		try {
			// Feature-based routing system
			let response: Response | null = null;
			
			// Try website routes first (homepage, about, services)
			response = await WebsiteRoutes.handleRoute(url.pathname, request, env, corsHeaders, config);
			if (response) return response;
			
			// Try contact routes (contact form, submit, admin)
			response = await ContactRoutes.handleRoute(url.pathname, request, env, corsHeaders, config);
			if (response) return response;
			
			// No route matched - return 404
			return createErrorResponse('Not Found', corsHeaders, 404);
			
		} catch (error) {
			console.error('Worker error:', error);
			return createErrorResponse('Internal Server Error', corsHeaders, 500);
		}
	},
} satisfies ExportedHandler<Env>;



