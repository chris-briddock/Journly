import { Resend } from 'resend';

// Initialize Resend client only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@journly.site';
const APP_NAME = 'Journly';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log('[Email] Email sent successfully:', { to, subject, id: result.data?.id });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, userName?: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;

  const subject = `Reset your ${APP_NAME} password`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style type="text/tailwindcss">
          @media (prefers-color-scheme: dark) {
            .email-container {
              background-color: #111827;
              color: #f9fafb;
            }
            .email-card {
              background-color: #1f2937;
              border-color: #374151;
            }
            .email-warning {
              background-color: #451a03;
              border-color: #92400e;
              color: #fbbf24;
            }
          }
        </style>
      </head>
      <body class="email-container bg-gray-50 text-gray-900 font-sans">
        <div class="max-w-2xl mx-auto p-6">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold font-serif text-gray-900 dark:text-white">${APP_NAME}</h1>
          </div>

          <!-- Main Card -->
          <div class="email-card bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0119 9z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reset Your Password</h2>
              <p class="text-gray-600 dark:text-gray-400">Hello${userName ? ` ${userName}` : ''}, we received a request to reset your password.</p>
            </div>

            <div class="space-y-4 mb-6">
              <p class="text-gray-700 dark:text-gray-300">
                We received a request to reset your password for your ${APP_NAME} account. Click the button below to create a new password:
              </p>

              <div class="text-center py-6">
                <a href="${resetUrl}"
                   class="inline-block bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium py-3 px-8 rounded-lg text-decoration-none transition-colors">
                  Reset Password
                </a>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p class="text-sm text-blue-600 dark:text-blue-400 break-all font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  ${resetUrl}
                </p>
              </div>
            </div>

            <!-- Warning Box -->
            <div class="email-warning bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-amber-800 dark:text-amber-200">Security Notice</h3>
                  <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    This link will expire in 1 hour for your security. If you didn't request this password reset, you can safely ignore this email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>This email was sent by ${APP_NAME}. If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Reset Your ${APP_NAME} Password

    Hello${userName ? ` ${userName}` : ''},

    We received a request to reset your password for your ${APP_NAME} account.

    To reset your password, visit this link: ${resetUrl}

    This link will expire in 1 hour for your security.

    If you didn't request this password reset, you can safely ignore this email.

    Best regards,
    The ${APP_NAME} Team
  `;

  return await sendEmail({ to: email, subject, html, text });
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(email: string, verificationToken: string, userName?: string) {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${verificationToken}`;

  const subject = `Verify your ${APP_NAME} account`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style type="text/tailwindcss">
          @media (prefers-color-scheme: dark) {
            .email-container {
              background-color: #111827;
              color: #f9fafb;
            }
            .email-card {
              background-color: #1f2937;
              border-color: #374151;
            }
            .email-info {
              background-color: #1e3a8a;
              border-color: #3b82f6;
              color: #dbeafe;
            }
          }
        </style>
      </head>
      <body class="email-container bg-gray-50 text-gray-900 font-sans">
        <div class="max-w-2xl mx-auto p-6">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">${APP_NAME}</h1>
          </div>

          <!-- Main Card -->
          <div class="email-card bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold font-serif text-gray-900 dark:text-white mb-2">Welcome to ${APP_NAME}!</h2>
              <p class="text-gray-600 dark:text-gray-400">Hello${userName ? ` ${userName}` : ''}, thank you for joining us!</p>
            </div>

            <div class="space-y-4 mb-6">
              <p class="text-gray-700 dark:text-gray-300">
                Thank you for creating an account with ${APP_NAME}. To complete your registration and start using your account, please verify your email address by clicking the button below:
              </p>

              <div class="text-center py-6">
                <a href="${verificationUrl}"
                   class="inline-block bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium py-3 px-8 rounded-lg text-decoration-none transition-colors">
                  Verify Email Address
                </a>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p class="text-sm text-blue-600 dark:text-blue-400 break-all font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  ${verificationUrl}
                </p>
              </div>
            </div>

            <!-- Info Box -->
            <div class="email-info bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">Quick Start</h3>
                  <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    This verification link will expire in 24 hours for security reasons. Once verified, you'll have access to all ${APP_NAME} features!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Welcome to the ${APP_NAME} community! We're excited to have you on board.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to ${APP_NAME}!

    Hello${userName ? ` ${userName}` : ''},

    Thank you for creating an account with ${APP_NAME}. To complete your registration, please verify your email address.

    Verification link: ${verificationUrl}

    This link will expire in 24 hours for security reasons.

    Welcome to the ${APP_NAME} community!

    Best regards,
    The ${APP_NAME} Team
  `;

  return await sendEmail({ to: email, subject, html, text });
}

/**
 * Send welcome email after email verification
 */
export async function sendWelcomeEmail(email: string, userName?: string) {
  const dashboardUrl = `${APP_URL}/dashboard`;

  const subject = `Welcome to ${APP_NAME}! Your account is ready`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${APP_NAME}</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style type="text/tailwindcss">
          @media (prefers-color-scheme: dark) {
            .email-container {
              background-color: #111827;
              color: #f9fafb;
            }
            .email-card {
              background-color: #1f2937;
              border-color: #374151;
            }
            .feature-card {
              background-color: #374151;
              border-color: #4b5563;
            }
          }
        </style>
      </head>
      <body class="email-container bg-gray-50 text-gray-900 font-sans">
        <div class="max-w-2xl mx-auto p-6">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold font-serif text-gray-900 dark:text-white">${APP_NAME}</h1>
          </div>

          <!-- Main Card -->
          <div class="email-card bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">🎉 Your account is verified!</h2>
              <p class="text-gray-600 dark:text-gray-400">Hello${userName ? ` ${userName}` : ''}, welcome to ${APP_NAME}!</p>
            </div>

            <div class="space-y-4 mb-6">
              <p class="text-gray-700 dark:text-gray-300 text-center">
                Congratulations! Your email has been verified and your ${APP_NAME} account is now fully active.
              </p>

              <!-- Feature Cards -->
              <div class="grid gap-4 mt-6">
                <div class="feature-card bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-900 dark:text-white">✍️ Start Writing</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Create your first post and share your ideas with the world.</p>
                    </div>
                  </div>
                </div>

                <div class="feature-card bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-900 dark:text-white">📚 Discover Content</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Explore posts from other writers and discover new perspectives.</p>
                    </div>
                  </div>
                </div>

                <div class="feature-card bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-900 dark:text-white">💬 Engage with Community</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Like, comment, and follow other writers to build your network.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center py-6">
                <a href="${dashboardUrl}"
                   class="inline-block bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium py-3 px-8 rounded-lg text-decoration-none transition-colors">
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Happy writing! We can't wait to see what you create.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to ${APP_NAME}!

    Hello${userName ? ` ${userName}` : ''},

    Congratulations! Your email has been verified and your ${APP_NAME} account is now fully active.

    Here's what you can do next:
    - Start writing your first post
    - Discover content from other writers
    - Engage with the community

    Visit your dashboard: ${dashboardUrl}

    Happy writing!

    Best regards,
    The ${APP_NAME} Team
  `;

  return await sendEmail({ to: email, subject, html, text });
}
