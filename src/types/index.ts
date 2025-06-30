/**
 * Core Application Types
 */

export interface FormSubmission {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	service_type: string;
	message: string;
	timestamp: string;
}

export interface CloudflareAccessUser {
	email: string;
	name?: string;
	sub?: string;
	aud?: string[];
	iss?: string;
	iat?: number;
	exp?: number;
}

export interface Env {
	DB: D1Database;
	MG_API_KEY: string;
	MG_DOMAIN: string;
	FROM_EMAIL: string;
	ADMIN_EMAIL: string;
	ENVIRONMENT?: string;
}

// Re-export ExecutionContext for clarity, though it's often globally available
// in Cloudflare Workers projects via @cloudflare/workers-types.
export type { ExecutionContext } from '@cloudflare/workers-types';