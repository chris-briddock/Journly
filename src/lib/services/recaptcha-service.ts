interface RecaptchaVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export class RecaptchaService {
  private static readonly VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
  private static readonly SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

  /**
   * Verify a reCAPTCHA token with Google's API
   */
  static async verifyToken(token: string, remoteip?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.SECRET_KEY) {
      console.error('reCAPTCHA secret key not configured');
      return { success: false, error: 'reCAPTCHA not configured' };
    }

    if (!token) {
      return { success: false, error: 'reCAPTCHA token is required' };
    }

    try {
      const params = new URLSearchParams({
        secret: this.SECRET_KEY,
        response: token,
      });

      // Add remote IP if provided
      if (remoteip) {
        params.append('remoteip', remoteip);
      }

      const response = await fetch(this.VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecaptchaVerificationResponse = await response.json();

      if (!data.success) {
        const errorCodes = data['error-codes'] || [];
        console.error('reCAPTCHA verification failed:', errorCodes);
        
        // Map error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          'missing-input-secret': 'reCAPTCHA configuration error',
          'invalid-input-secret': 'reCAPTCHA configuration error',
          'missing-input-response': 'Please complete the reCAPTCHA',
          'invalid-input-response': 'Invalid reCAPTCHA response',
          'bad-request': 'reCAPTCHA request error',
          'timeout-or-duplicate': 'reCAPTCHA has expired, please try again',
        };

        const firstError = errorCodes[0];
        const errorMessage = errorMessages[firstError] || 'reCAPTCHA verification failed';
        
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      return { success: false, error: 'Failed to verify reCAPTCHA' };
    }
  }

  /**
   * Extract client IP address from request headers
   */
  static getClientIP(request: Request): string | undefined {
    // Try various headers that might contain the real IP
    const headers = [
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'cf-connecting-ip', // Cloudflare
      'x-forwarded',
      'forwarded-for',
      'forwarded',
    ];

    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        // x-forwarded-for can contain multiple IPs, take the first one
        const ip = value.split(',')[0].trim();
        if (ip && ip !== 'unknown') {
          return ip;
        }
      }
    }

    return undefined;
  }

  /**
   * Check if reCAPTCHA is enabled (has site key configured)
   */
  static isEnabled(): boolean {
    return !!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && this.SECRET_KEY);
  }
}
