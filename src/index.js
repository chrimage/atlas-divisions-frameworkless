/**
 * Atlas Divisions - Simple Worker
 * 
 * Static site with API endpoints for:
 * - Contact form submission (/submit)
 * - Admin panel (/admin)
 * 
 * Features: Mailgun email notifications, Cloudflare Access auth
 */

// Simple Cloudflare Access auth function
function extractUserFromAccessToken(request) {
    try {
        const userJWT = request.headers.get('Cf-Access-Jwt-Assertion');
        if (!userJWT) return null;
        
        const parts = userJWT.split('.');
        if (parts.length !== 3) return null;
        
        // Decode JWT payload
        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const decodedPayload = JSON.parse(atob(paddedBase64));
        
        // Check expiration
        if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        
        return {
            email: decodedPayload.email,
            name: decodedPayload.name || decodedPayload.email
        };
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

// Simple email notification function using collaborator's Mailgun implementation
async function sendAdminNotification(env, submission) {
    if (!env.MG_API_KEY || !env.MG_DOMAIN || !env.ADMIN_EMAIL || !env.FROM_EMAIL_NAME) {
        console.log('❌ MG_API_KEY, MG_DOMAIN, ADMIN_EMAIL, or FROM_EMAIL_NAME not configured, skipping notification');
        return;
    }
    
    try {
        const subject = `Atlas Divisions Contact: ${submission.service_type} - ${submission.name}`;
        const text = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 New Atlas Divisions Contact Form Submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Customer: ${submission.name}
📧 Email: ${submission.email || 'Not provided'}
📱 Phone: ${submission.phone || 'Not provided'}
🔧 Service: ${submission.service_type}

💬 Message:
${submission.message}

🕒 Submitted: ${new Date(submission.timestamp).toLocaleString()}
🌐 Environment: ${env.ENVIRONMENT || 'production'}
📝 Submission ID: ${submission.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solutions That Outlast the Storm - Reply directly to contact the customer.
        `.trim();
        
        const domain = env.MG_DOMAIN;
        const apiKey = env.MG_API_KEY;
        
        // Construct from email using FROM_EMAIL_NAME + MG_DOMAIN
        const fromEmail = `${env.FROM_EMAIL_NAME}@${domain}`;
        
        const params = new URLSearchParams({
            from: `Atlas Divisions Contact System <${fromEmail}>`,
            to: env.ADMIN_EMAIL,
            subject: subject,
            text: text
        });
        
        const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + btoa(`api:${apiKey}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Email failed: ${response.status} ${response.statusText} - ${errorText}`);
        } else {
            console.log(`✅ Email notification sent successfully for submission ${submission.id}`);
        }
    } catch (error) {
        console.error('Error sending Atlas Divisions email:', error);
        // Don't throw - email failure shouldn't break form submission
    }
}

// Simple success page
const SUCCESS_HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Message Sent - Atlas Divisions</title>
<style>body{font-family:Arial;background:#0a0a0a;color:#fff;text-align:center;padding:2rem;}
.container{max-width:600px;margin:0 auto;background:rgba(26,26,26,0.95);padding:2rem;border-radius:12px;border:1px solid rgba(212,175,55,0.2);}
h1{color:#d4af37;margin-bottom:1rem;}
.btn{background:#008080;color:white;padding:1rem 2rem;text-decoration:none;border-radius:8px;display:inline-block;margin-top:1rem;}
</style></head><body>
<div class="container">
<h1>✅ Message Sent Successfully!</h1>
<p>Thank you for contacting Atlas Divisions. We'll respond within 24 hours.</p>
<a href="/" class="btn">← Back to Homepage</a>
</div></body></html>`;

// HTML escaping utility for security
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Enhanced admin panel with proper status handling and message truncation
const ADMIN_HTML = (submissions, user) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Atlas Divisions - Admin</title>
<style>
body{font-family:Arial;background:#0a0a0a;color:#fff;padding:1rem;margin:0;}
.container{max-width:1400px;margin:0 auto;}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;}
.back{margin-bottom:1rem;}
h1{color:#d4af37;margin-bottom:0.5rem;}
.stats{display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;}
.stat-card{background:rgba(26,26,26,0.95);padding:1rem;border-radius:8px;border:1px solid rgba(212,175,55,0.2);min-width:120px;}
.stat-number{font-size:1.5rem;font-weight:bold;color:#d4af37;}
.stat-label{font-size:0.875rem;color:#b8b8b8;}
.user-info{background:rgba(212,175,55,0.1);padding:1rem;border-radius:8px;margin-bottom:2rem;color:#d4af37;}
.table-container{overflow-x:auto;background:rgba(26,26,26,0.95);border-radius:8px;border:1px solid rgba(212,175,55,0.2);}
table{width:100%;border-collapse:collapse;min-width:900px;}
th,td{padding:1rem;text-align:left;border-bottom:1px solid rgba(212,175,55,0.1);}
th{background:rgba(212,175,55,0.1);color:#d4af37;font-weight:600;position:sticky;top:0;}
tr:hover{background:rgba(212,175,55,0.05);}
.message-cell{max-width:200px;position:relative;}
.message-preview{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic;color:#b8b8b8;}
.phone-cell{color:#b8b8b8;}
.no-data{color:#666;font-style:italic;}
.status{padding:0.4rem 0.8rem;border-radius:4px;font-size:0.875rem;font-weight:500;text-transform:uppercase;}
.status-new{background:#e67e22;color:white;}
.status-in_progress{background:#3498db;color:white;}
.status-resolved{background:#27ae60;color:white;}
.status-cancelled{background:#e74c3c;color:white;}
.btn{background:#008080;color:white;padding:0.5rem 1rem;text-decoration:none;border-radius:4px;font-size:0.875rem;border:none;cursor:pointer;}
.btn:hover{background:#006666;}
.email{color:#d4af37;text-decoration:none;}
.email:hover{text-decoration:underline;}
.action-form{display:flex;gap:0.5rem;align-items:center;}
.status-select{background:#1a1a1a;color:#fff;border:1px solid rgba(212,175,55,0.2);padding:0.4rem;border-radius:4px;font-size:0.875rem;}
.update-btn{background:#008080;color:white;border:none;padding:0.4rem 0.8rem;border-radius:4px;cursor:pointer;font-size:0.875rem;}
.update-btn:hover{background:#006666;}
.empty-state{text-align:center;padding:3rem;color:#b8b8b8;}
.empty-state h3{color:#d4af37;margin-bottom:1rem;}
.empty-state a{color:#008080;text-decoration:none;}
.empty-state a:hover{text-decoration:underline;}
@media (max-width: 768px) {
  .stats{flex-direction:column;}
  .stat-card{min-width:auto;}
  th,td{padding:0.5rem;font-size:0.875rem;}
  .message-cell{max-width:120px;}
}
</style></head><body>
<div class="container">
<div class="back"><a href="/" class="btn">← Back to Homepage</a></div>
<div class="user-info">👤 Logged in as: ${escapeHtml(user.name)} (${escapeHtml(user.email)})</div>
<h1>📋 Contact Submissions</h1>
<div class="stats">
<div class="stat-card">
<div class="stat-number">${submissions.length}</div>
<div class="stat-label">Total</div>
</div>
<div class="stat-card">
<div class="stat-number">${submissions.filter(s => (s.status || 'new') === 'new').length}</div>
<div class="stat-label">New</div>
</div>
<div class="stat-card">
<div class="stat-number">${submissions.filter(s => s.status === 'in_progress').length}</div>
<div class="stat-label">In Progress</div>
</div>
<div class="stat-card">
<div class="stat-number">${submissions.filter(s => s.status === 'resolved').length}</div>
<div class="stat-label">Resolved</div>
</div>
</div>
${submissions.length === 0 ? `
<div class="empty-state">
<h3>No submissions yet</h3>
<p>Waiting for the first contact form submission...</p>
<a href="/">Test Contact Form</a>
</div>
` : `
<div class="table-container">
<table>
<thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
<tbody>
${submissions.map(sub => `
<tr>
<td>${new Date(sub.created_at).toLocaleDateString()}</td>
<td>${escapeHtml(sub.name)}</td>
<td><a href="mailto:${escapeHtml(sub.email || '')}" class="email">${sub.email ? escapeHtml(sub.email) : '<span class="no-data">N/A</span>'}</a></td>
<td class="phone-cell">${sub.phone ? escapeHtml(sub.phone) : '<span class="no-data">N/A</span>'}</td>
<td>${escapeHtml(sub.service_type)}</td>
<td class="message-cell" title="${escapeHtml(sub.message)}">
<div class="message-preview">${escapeHtml(sub.message.substring(0, 50))}${sub.message.length > 50 ? '...' : ''}</div>
</td>
<td><span class="status status-${sub.status || 'new'}">${(sub.status || 'new').replace('_', ' ')}</span></td>
<td>
<form class="action-form" method="POST" action="/admin/update">
<input type="hidden" name="id" value="${sub.id}">
<select name="status" class="status-select" onchange="this.form.submit()">
<option value="new" ${(sub.status || 'new') === 'new' ? 'selected' : ''}>New</option>
<option value="in_progress" ${sub.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
<option value="resolved" ${sub.status === 'resolved' ? 'selected' : ''}>Resolved</option>
<option value="cancelled" ${sub.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
</select>
</form>
</td>
</tr>
`).join('')}
</tbody>
</table>
</div>
`}
</div></body></html>`;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        try {
            // Contact form submission
            if (url.pathname === '/submit' && request.method === 'POST') {
                const formData = await request.formData();
                
                // Basic validation
                const name = formData.get('name')?.toString().trim();
                const email = formData.get('email')?.toString().trim();
                const service_type = formData.get('service_type')?.toString().trim();
                const message = formData.get('message')?.toString().trim();
                
                if (!name || !service_type || !message) {
                    return new Response('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Error</title></head><body><h1>Error: Missing required fields</h1><a href="/">Go back</a></body></html>', {
                        status: 400,
                        headers: { 
                            'Content-Type': 'text/html; charset=utf-8',
                            'X-Frame-Options': 'DENY',
                            'X-Content-Type-Options': 'nosniff',
                            'X-XSS-Protection': '1; mode=block'
                        }
                    });
                }
                
                // Save to database
                const submission = {
                    id: crypto.randomUUID(),
                    name,
                    email: email || null,
                    phone: formData.get('phone')?.toString().trim() || null,
                    service_type,
                    message,
                    status: 'new',
                    timestamp: new Date().toISOString()
                };
                
                await env.DB.prepare(`
                    INSERT INTO submissions (id, name, email, phone, service_type, message, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    submission.id, submission.name, submission.email, submission.phone,
                    submission.service_type, submission.message, submission.status, submission.timestamp
                ).run();
                
                // Send email notification (async, doesn't block response)
                await sendAdminNotification(env, submission);
                
                return new Response(SUCCESS_HTML, { 
                    headers: { 
                        'Content-Type': 'text/html; charset=utf-8',
                        'X-Frame-Options': 'DENY',
                        'X-Content-Type-Options': 'nosniff',
                        'X-XSS-Protection': '1; mode=block'
                    } 
                });
            }
            
            // Admin panel with Cloudflare Access authentication
            if (url.pathname === '/admin' && request.method === 'GET') {
                // Check Cloudflare Access authentication
                const user = extractUserFromAccessToken(request);
                if (!user) {
                    return new Response(`
                        <!DOCTYPE html>
                        <html><head><meta charset="UTF-8"><title>Access Denied</title>
                        <style>body{font-family:Arial;background:#0a0a0a;color:#fff;text-align:center;padding:2rem;}
                        .container{max-width:600px;margin:0 auto;background:rgba(26,26,26,0.95);padding:2rem;border-radius:12px;border:1px solid rgba(212,175,55,0.2);}
                        h1{color:#dc143c;margin-bottom:1rem;}</style></head><body>
                        <div class="container">
                        <h1>🔒 Admin Access Required</h1>
                        <p>Please authenticate through Cloudflare Access to view this page.</p>
                        <p>Contact the administrator if you need access.</p>
                        </div></body></html>
                    `, { 
                        status: 401,
                        headers: { 
                            'Content-Type': 'text/html; charset=utf-8',
                            'X-Frame-Options': 'DENY',
                            'X-Content-Type-Options': 'nosniff',
                            'X-XSS-Protection': '1; mode=block'
                        } 
                    });
                }
                
                const { results } = await env.DB.prepare(`
                    SELECT * FROM submissions ORDER BY created_at DESC
                `).all();
                
                return new Response(ADMIN_HTML(results, user), { 
                    headers: { 
                        'Content-Type': 'text/html; charset=utf-8',
                        'X-Frame-Options': 'DENY',
                        'X-Content-Type-Options': 'nosniff',
                        'X-XSS-Protection': '1; mode=block'
                    } 
                });
            }
            
            // Update submission status (also requires authentication)
            if (url.pathname === '/admin/update' && request.method === 'POST') {
                const user = extractUserFromAccessToken(request);
                if (!user) {
                    return new Response('Unauthorized', { status: 401 });
                }
                
                const formData = await request.formData();
                const id = formData.get('id')?.toString();
                const status = formData.get('status')?.toString();
                
                if (id && ['new', 'in_progress', 'resolved', 'cancelled'].includes(status)) {
                    await env.DB.prepare(`
                        UPDATE submissions SET status = ? WHERE id = ?
                    `).bind(status, id).run();
                }
                
                return Response.redirect(new URL('/admin', request.url), 302);
            }
            
            // Everything else: serve static files
            return env.ASSETS.fetch(request);
            
        } catch (error) {
            console.error('Worker error:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
};