'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface RecaptchaRef {
  getValue: () => string | null;
  reset: () => void;
  execute: () => void;
}

interface RecaptchaProps {
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  tabindex?: number;
  className?: string;
}

export const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(
  ({ onChange, onExpired, onError, theme = 'light', size = 'normal', tabindex, className }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        return recaptchaRef.current?.getValue() || null;
      },
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      },
    }));

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return null;
    }

    return (
      <div className={className}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onChange}
          onExpired={onExpired}
          onError={onError}
          theme={theme}
          size={size}
          tabindex={tabindex}
        />
      </div>
    );
  }
);

Recaptcha.displayName = 'Recaptcha';
