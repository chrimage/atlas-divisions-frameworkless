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
    if (!env.MG_API_KEY || !env.MG_DOMAIN || !env.ADMIN_EMAIL) {
        console.log('❌ MG_API_KEY, MG_DOMAIN, or ADMIN_EMAIL not configured, skipping notification');
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
        
        console.log(`🌍 Sending Atlas Divisions email via domain: ${domain}`);
        const params = new URLSearchParams({
            from: `Atlas Divisions Contact System <${env.FROM_EMAIL}>`,
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
            console.error(`❌ Email failed: ${response.status} ${response.statusText}`);
        } else {
            console.log(`✅ Atlas Divisions email sent: ${response.status} - submission ${submission.id}`);
        }
    } catch (error) {
        console.error('Error sending Atlas Divisions email:', error);
        // Don't throw - email failure shouldn't break form submission
    }
}

// Simple success page
const SUCCESS_HTML = `<!DOCTYPE html>
<html><head><title>Message Sent - Atlas Divisions</title>
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

// Simple admin panel
const ADMIN_HTML = (submissions, user) => `<!DOCTYPE html>
<html><head><title>Atlas Divisions - Admin</title>
<style>body{font-family:Arial;background:#0a0a0a;color:#fff;padding:1rem;}
.container{max-width:1200px;margin:0 auto;}
h1{color:#d4af37;margin-bottom:2rem;}
table{width:100%;border-collapse:collapse;background:rgba(26,26,26,0.95);border-radius:8px;overflow:hidden;}
th,td{padding:1rem;text-align:left;border-bottom:1px solid rgba(212,175,55,0.2);}
th{background:rgba(212,175,55,0.1);color:#d4af37;font-weight:600;}
.status{padding:0.25rem 0.5rem;border-radius:4px;font-size:0.875rem;}
.status-new{background:#dc143c;color:white;}
.status-contacted{background:#008080;color:white;}
.status-resolved{background:#228b22;color:white;}
.btn{background:#008080;color:white;padding:0.5rem 1rem;text-decoration:none;border-radius:4px;font-size:0.875rem;}
.email{color:#d4af37;text-decoration:none;}
.back{margin-bottom:2rem;}
.user-info{background:rgba(212,175,55,0.1);padding:1rem;border-radius:8px;margin-bottom:2rem;color:#d4af37;}
</style></head><body>
<div class="container">
<div class="back"><a href="/" class="btn">← Back to Homepage</a></div>
<div class="user-info">👤 Logged in as: ${user.name} (${user.email})</div>
<h1>📋 Contact Submissions</h1>
<table>
<thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Service</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
<tbody>
${submissions.map(sub => `
<tr>
<td>${new Date(sub.timestamp).toLocaleDateString()}</td>
<td>${sub.name}</td>
<td><a href="mailto:${sub.email}" class="email">${sub.email}</a></td>
<td>${sub.service_type}</td>
<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${sub.message}">${sub.message}</td>
<td><span class="status status-${sub.status || 'new'}">${(sub.status || 'new').toUpperCase()}</span></td>
<td>
<form style="display:inline;" method="POST" action="/admin/update">
<input type="hidden" name="id" value="${sub.id}">
<select name="status" style="background:#1a1a1a;color:#fff;border:1px solid rgba(212,175,55,0.2);padding:0.25rem;border-radius:4px;">
<option value="new" ${(sub.status || 'new') === 'new' ? 'selected' : ''}>New</option>
<option value="contacted" ${sub.status === 'contacted' ? 'selected' : ''}>Contacted</option>
<option value="resolved" ${sub.status === 'resolved' ? 'selected' : ''}>Resolved</option>
</select>
<button type="submit" style="background:#008080;color:white;border:none;padding:0.25rem 0.5rem;border-radius:4px;margin-left:0.5rem;cursor:pointer;">Update</button>
</form>
</td>
</tr>
`).join('')}
</tbody>
</table>
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
                    return new Response('<h1>Error: Missing required fields</h1><a href="/">Go back</a>', {
                        status: 400,
                        headers: { 'Content-Type': 'text/html' }
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
                    INSERT INTO contact_submissions (id, name, email, phone, service_type, message, status, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    submission.id, submission.name, submission.email, submission.phone,
                    submission.service_type, submission.message, submission.status, submission.timestamp
                ).run();
                
                // Send email notification (async, doesn't block response)
                await sendAdminNotification(env, submission);
                
                return new Response(SUCCESS_HTML, { 
                    headers: { 'Content-Type': 'text/html' } 
                });
            }
            
            // Admin panel with Cloudflare Access authentication
            if (url.pathname === '/admin' && request.method === 'GET') {
                // Check Cloudflare Access authentication
                const user = extractUserFromAccessToken(request);
                if (!user) {
                    return new Response(`
                        <!DOCTYPE html>
                        <html><head><title>Access Denied</title>
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
                        headers: { 'Content-Type': 'text/html' } 
                    });
                }
                
                const { results } = await env.DB.prepare(`
                    SELECT * FROM contact_submissions ORDER BY timestamp DESC
                `).all();
                
                return new Response(ADMIN_HTML(results, user), { 
                    headers: { 'Content-Type': 'text/html' } 
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
                
                if (id && ['new', 'contacted', 'resolved'].includes(status)) {
                    await env.DB.prepare(`
                        UPDATE contact_submissions SET status = ? WHERE id = ?
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