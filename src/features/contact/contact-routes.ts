/**
 * Contact Feature Routes
 * Handles all contact form related routes and functionality
 */

import type { FormSubmission, CloudflareAccessUser, Env } from '../../types/index.js';
import type { CONFIG } from '../../config/index.js';

// Import utilities
import { extractUserFromAccessToken, validateAdminAccess } from '../../utils/auth.js';
import { sendAdminNotification, shouldSendEmail, logEmailStatus } from '../../utils/email.js';
import { validateFormSubmission, parseFormData, createFormSubmission } from '../../utils/validation.js';
import { saveSubmission, getAllSubmissions, updateSubmissionStatus } from '../../utils/database.js';
import { createHtmlResponse, createErrorResponse, createRedirectResponse } from '../../utils/cors.js';
import { validateCSRFToken, getSessionId } from '../../utils/csrf.js';

// Import templates
import { getContactFormHTML } from './contact-templates.js';
import { getSuccessHTML } from '../../templates/success.js';
import { getErrorHTML } from '../../templates/error.js';
import { getAdminHTML } from '../../templates/admin.js';

export class ContactRoutes {
  /**
   * Handle contact form display
   */
  static async handleContactForm(request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
    return createHtmlResponse(getContactFormHTML(config), corsHeaders);
  }

  /**
   * Handle form submission
   */
  static async handleSubmit(request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
    try {
      const formData = await request.formData();
      const parsedData = parseFormData(formData);
      
      // Validate form data
      const validation = validateFormSubmission(parsedData, config);
      if (!validation.isValid) {
        return createHtmlResponse(
          getErrorHTML(validation.errors.join(', '), config),
          corsHeaders,
          400
        );
      }

      // Create submission object
      const submissionData = createFormSubmission(parsedData);
      const submission: FormSubmission = {
        id: crypto.randomUUID(),
        ...submissionData,
        timestamp: new Date().toISOString()
      };

      // Save to database
      await saveSubmission(env, submission);

      // Send email notification asynchronously (doesn't block response)
      if (shouldSendEmail(config, env)) {
        console.log("Sending admin notification");
        await sendAdminNotification(env, submission);
        console.log("Admin notification completed");
      } else {
        logEmailStatus(config, env);
      }

      return createHtmlResponse(getSuccessHTML(config), corsHeaders);
    } catch (error) {
      console.error('Submit error:', error);
      return createHtmlResponse(
        getErrorHTML('Database error occurred', config),
        corsHeaders,
        500
      );
    }
  }

  /**
   * Handle admin panel display
   */
  static async handleAdmin(request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
    try {
      // Extract user identity from Cloudflare Access token
      const user = await extractUserFromAccessToken(request, config.security.cloudflareAccessTeamName);
      
      // Validate admin access
      if (!validateAdminAccess(user, config)) {
        if (!user) {
          return createErrorResponse('Unauthorized - Admin access required', corsHeaders, 401);
        } else {
          return createErrorResponse('Forbidden - Email not in admin list', corsHeaders, 403);
        }
      }

      if (user) {
        console.log(`Admin access: ${user.email}`);
      }

      // Get all submissions
      const submissions = await getAllSubmissions(env);

      return createHtmlResponse(getAdminHTML(submissions, user, config), corsHeaders);
    } catch (error) {
      console.error('Admin error:', error);
      return createErrorResponse('Internal Server Error', corsHeaders, 500);
    }
  }

  /**
   * Handle submission status updates
   */
  static async handleStatusUpdate(request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response> {
    try {
      // Extract user identity from Cloudflare Access token
      const user = await extractUserFromAccessToken(request, config.security.cloudflareAccessTeamName);
      
      if (!user) {
        return createErrorResponse('Unauthorized - Admin access required', corsHeaders, 401);
      }
      
      const formData = await request.formData();
      const id = formData.get('id')?.toString();
      const status = formData.get('status')?.toString();
      const csrfToken = formData.get('csrf_token')?.toString();

      if (!id || !status) {
        return createErrorResponse('Missing ID or status', corsHeaders, 400);
      }
      
      // Validate CSRF token
      if (!csrfToken) {
        return createErrorResponse('Missing CSRF token', corsHeaders, 400);
      }
      
      const sessionId = getSessionId(user);
      if (!validateCSRFToken(sessionId, csrfToken)) {
        return createErrorResponse('Invalid CSRF token', corsHeaders, 403);
      }

      // Validate status values using imported validation
      const validStatuses = config.admin.statusOptions.map((option: any) => option.value);
      if (!validStatuses.includes(status)) {
        return createErrorResponse('Invalid status value', corsHeaders, 400);
      }

      console.log(`Status update: ${id} -> ${status} by ${user?.email || 'unknown'}`);

      // Update submission status using database utility
      await updateSubmissionStatus(env, id, status);

      // Redirect back to admin panel
      return createRedirectResponse('/admin', corsHeaders);
    } catch (error) {
      console.error('Update error:', error);
      return createErrorResponse('Update failed', corsHeaders, 500);
    }
  }

  /**
   * Route handler for contact-related paths
   */
  static async handleRoute(pathname: string, request: Request, env: Env, corsHeaders: Record<string, string>, config: CONFIG): Promise<Response | null> {
    const method = request.method;

    // Contact form routes
    if (pathname === '/contact' && method === 'GET') {
      return this.handleContactForm(request, env, corsHeaders, config);
    }
    
    // Legacy contact form route
    if (pathname === '/contact-form' && method === 'GET') {
      return this.handleContactForm(request, env, corsHeaders, config);
    }
    
    // Form submission
    if (pathname === '/submit' && method === 'POST') {
      return this.handleSubmit(request, env, corsHeaders, config);
    }
    
    // Admin panel
    if (pathname === '/admin' && method === 'GET') {
      return this.handleAdmin(request, env, corsHeaders, config);
    }
    
    // Admin status updates
    if (pathname === '/admin/update' && method === 'POST') {
      return this.handleStatusUpdate(request, env, corsHeaders, config);
    }

    // Route not handled by contact feature
    return null;
  }
}