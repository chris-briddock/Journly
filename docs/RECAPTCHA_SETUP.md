# Google reCAPTCHA v2 Setup Guide

## Overview

This guide explains how to set up Google reCAPTCHA v2 for the login and registration forms to prevent spam and bot attacks.

## Prerequisites

- Google account
- Access to Google reCAPTCHA Admin Console

## Step 1: Create reCAPTCHA Site

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Fill in the form:
   - **Label**: Your site name (e.g., "Journly Blog Platform")
   - **reCAPTCHA type**: Select "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - `yourdomain.com` (for production)
     - Any other domains you'll use
4. Accept the reCAPTCHA Terms of Service
5. Click "Submit"

## Step 2: Get Your Keys

After creating the site, you'll receive:
- **Site Key** (public key) - Used in the frontend
- **Secret Key** (private key) - Used in the backend

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```bash
# Google reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key-here"
RECAPTCHA_SECRET_KEY="your-secret-key-here"
```

**Important Notes:**
- The `NEXT_PUBLIC_` prefix makes the site key available to the client-side code
- The secret key should NEVER be exposed to the client
- Replace `your-site-key-here` and `your-secret-key-here` with your actual keys

## Step 4: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login or registration page
3. You should see the reCAPTCHA checkbox
4. Complete the CAPTCHA and submit the form
5. Check the browser console and server logs for any errors

## Features Implemented

### Frontend Features
- ✅ **reCAPTCHA Component** - Reusable React component with TypeScript support
- ✅ **Form Integration** - Added to both login and register forms
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Auto-reset** - CAPTCHA resets on form submission errors
- ✅ **Conditional Rendering** - Only shows when configured

### Backend Features
- ✅ **Server Verification** - Validates tokens with Google's API
- ✅ **IP Address Tracking** - Includes client IP for enhanced security
- ✅ **Error Mapping** - Maps Google error codes to user-friendly messages
- ✅ **NextAuth Integration** - Works with credentials provider
- ✅ **Registration API** - Validates CAPTCHA during user registration

### Security Features
- ✅ **Token Validation** - Verifies each CAPTCHA token with Google
- ✅ **Single Use** - Tokens are automatically invalidated after use
- ✅ **Timeout Protection** - Handles expired CAPTCHA tokens
- ✅ **Error Recovery** - Graceful handling of CAPTCHA failures

## Configuration Options

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | No | Public site key from Google reCAPTCHA |
| `RECAPTCHA_SECRET_KEY` | No | Private secret key from Google reCAPTCHA |

### Behavior

- **When Configured**: reCAPTCHA appears on login and register forms
- **When Not Configured**: Forms work normally without CAPTCHA
- **Graceful Degradation**: Application works with or without reCAPTCHA

## Troubleshooting

### Common Issues

**1. reCAPTCHA not appearing**
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
- Verify the site key is correct
- Check browser console for JavaScript errors

**2. "reCAPTCHA not configured" error**
- Ensure `RECAPTCHA_SECRET_KEY` is set in your environment
- Restart your development server after adding environment variables

**3. "Invalid site key" error**
- Verify the site key matches your Google reCAPTCHA configuration
- Check that your domain is added to the allowed domains list

**4. "reCAPTCHA verification failed" error**
- Check that the secret key is correct
- Verify your server can reach Google's verification API
- Check server logs for detailed error messages

**5. CAPTCHA appears but verification fails**
- Ensure both site key and secret key are from the same reCAPTCHA site
- Check that the domain matches your reCAPTCHA configuration
- Verify network connectivity to Google's servers

### Development vs Production

**Development:**
- Add `localhost` to your reCAPTCHA domains
- Use the same keys for local development
- Check browser console for detailed error messages

**Production:**
- Add your production domain to reCAPTCHA configuration
- Use environment variables for key management
- Monitor server logs for verification failures

## API Endpoints

### Verification Endpoint
- **URL**: `/api/auth/verify-captcha`
- **Method**: POST
- **Body**: `{ "token": "recaptcha-token" }`
- **Response**: `{ "success": true/false, "error": "message" }`

### Integration Points
- **Registration**: `/api/register` - Validates CAPTCHA before creating account
- **Login**: NextAuth credentials provider - Validates CAPTCHA before authentication

## Security Considerations

1. **Secret Key Protection**: Never expose the secret key to client-side code
2. **Domain Validation**: Only add necessary domains to your reCAPTCHA configuration
3. **Rate Limiting**: Consider implementing additional rate limiting for form submissions
4. **Monitoring**: Monitor CAPTCHA verification rates and failure patterns
5. **Backup Plan**: Ensure your application works if reCAPTCHA service is unavailable

## Testing

### Manual Testing
1. Complete the CAPTCHA successfully - form should submit
2. Don't complete the CAPTCHA - should show error message
3. Let CAPTCHA expire - should show expiration message
4. Submit form multiple times - CAPTCHA should reset properly

### Automated Testing
- E2E tests may need to be updated to handle CAPTCHA
- Consider using test keys for automated testing environments
- Mock the reCAPTCHA service for unit tests

## Support

For issues with:
- **Google reCAPTCHA**: Check [Google reCAPTCHA documentation](https://developers.google.com/recaptcha)
- **Implementation**: Check server logs and browser console
- **Configuration**: Verify environment variables and domain settings
