/**
 * Website Feature Routes
 * Handles all website/brand presence related routes
 */

import type { Env } from '../../types/index.js';
import type { CONFIG } from '../../config/index.js'; // Import CONFIG type
import { createHtmlResponse, createErrorResponse } from '../../utils/cors.js';
import { getHomepageHTML } from './website-templates.js';

export class WebsiteRoutes {
  /**
   * Handle homepage display
   */
  static async handleHomepage(request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
    return await getHomepageHTML(corsHeaders, config);
  }

  /**
   * Handle about page (future feature)
   */
  static async handleAbout(request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
    // Future implementation for dedicated about page
    return createErrorResponse('About page coming soon', corsHeaders, 404);
  }

  /**
   * Handle services page (future feature)
   */
  static async handleServices(request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
    // Future implementation for dedicated services page
    return createErrorResponse('Services page coming soon', corsHeaders, 404);
  }

  /**
   * Route handler for website-related paths
   */
  static async handleRoute(pathname: string, request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response | null> {
    const method = request.method;

    // Homepage
    if (pathname === '/' && method === 'GET') {
      return this.handleHomepage(request, env, corsHeaders, config);
    }
    
    // Future routes
    if (pathname === '/about' && method === 'GET') {
      return this.handleAbout(request, env, corsHeaders, config);
    }
    
    if (pathname === '/services' && method === 'GET') {
      return this.handleServices(request, env, corsHeaders, config);
    }

    // Route not handled by website feature
    return null;
  }
}