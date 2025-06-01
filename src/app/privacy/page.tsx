import type { Metadata } from 'next/types';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - Journly',
  description: 'Learn how Journly collects, uses, and protects your personal information. Your privacy is our priority.',
  openGraph: {
    title: 'Privacy Policy - Journly',
    description: 'Learn how Journly collects, uses, and protects your personal information. Your privacy is our priority.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: January 2024
            </p>
          </div>

          {/* Quick Overview */}
          <div className="bg-muted/50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Quick Overview</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <Eye className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">What We Collect</h3>
                  <p className="text-sm text-muted-foreground">
                    Only essential information needed to provide our service
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Lock className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">How We Protect</h3>
                  <p className="text-sm text-muted-foreground">
                    Industry-standard encryption and security measures
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Database className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Your Control</h3>
                  <p className="text-sm text-muted-foreground">
                    You can access, modify, or delete your data anytime
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Eye className="h-8 w-8 text-primary mr-3" />
              Information We Collect
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Account Information</h3>
                <p className="text-muted-foreground">
                  When you create an account, we collect your email address, username, and password.
                  You may optionally provide additional profile information such as your name and bio.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Content You Create</h3>
                <p className="text-muted-foreground">
                  We store the blog posts, comments, and other content you create on our platform.
                  This includes text, images, and metadata associated with your content.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Usage Information</h3>
                <p className="text-muted-foreground">
                  We automatically collect information about how you use our service, including
                  pages visited, features used, and interactions with content.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Technical Information</h3>
                <p className="text-muted-foreground">
                  We collect technical information such as your IP address, browser type,
                  device information, and operating system for security and functionality.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Database className="h-8 w-8 text-primary mr-3" />
              How We Use Your Information
            </h2>
            <div className="bg-muted/50 rounded-lg p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Provide Our Service</h3>
                    <p className="text-muted-foreground text-sm">
                      Create and maintain your account, publish your content, and enable platform features
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Improve Our Platform</h3>
                    <p className="text-muted-foreground text-sm">
                      Analyze usage patterns and enhance user experience
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Communication</h3>
                    <p className="text-muted-foreground text-sm">
                      Send important updates, security alerts, and respond to your inquiries
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Security & Compliance</h3>
                    <p className="text-muted-foreground text-sm">
                      Protect against fraud, abuse, and comply with applicable laws
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Lock className="h-8 w-8 text-primary mr-3" />
              Information Sharing
            </h2>
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 mb-6">
              <p className="text-lg font-semibold text-destructive mb-2">
                🚫 We do not sell your personal information
              </p>
              <p className="text-muted-foreground">
                Your privacy is not for sale. We never sell, rent, or trade your personal data to third parties.
              </p>
            </div>

            <p className="text-muted-foreground mb-6">We may share information only in these limited circumstances:</p>

            <div className="space-y-4">
              <div className="flex items-start bg-card border rounded-lg p-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Public Content</h3>
                  <p className="text-muted-foreground text-sm">Blog posts and comments you publish are publicly visible by design</p>
                </div>
              </div>

              <div className="flex items-start bg-card border rounded-lg p-4">
                <div className="bg-green-100 dark:bg-green-900/20 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 text-sm">🤝</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Service Providers</h3>
                  <p className="text-muted-foreground text-sm">With trusted third parties who help us operate our platform securely</p>
                </div>
              </div>

              <div className="flex items-start bg-card border rounded-lg p-4">
                <div className="bg-orange-100 dark:bg-orange-900/20 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <span className="text-orange-600 dark:text-orange-400 text-sm">⚖️</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Legal Requirements</h3>
                  <p className="text-muted-foreground text-sm">When required by law or to protect our rights and users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              Data Security
            </h2>
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
              <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                🔒 Your data is protected with industry-standard security
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center bg-card border rounded-lg p-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                  <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Encryption</h3>
                  <p className="text-muted-foreground text-sm">Data encrypted in transit and at rest</p>
                </div>
              </div>

              <div className="flex items-center bg-card border rounded-lg p-4">
                <div className="bg-green-100 dark:bg-green-900/20 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Security Audits</h3>
                  <p className="text-muted-foreground text-sm">Regular security reviews and updates</p>
                </div>
              </div>

              <div className="flex items-center bg-card border rounded-lg p-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Access Controls</h3>
                  <p className="text-muted-foreground text-sm">Strict authentication measures</p>
                </div>
              </div>

              <div className="flex items-center bg-card border rounded-lg p-4">
                <div className="bg-orange-100 dark:bg-orange-900/20 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                  <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure Infrastructure</h3>
                  <p className="text-muted-foreground text-sm">Protected hosting environment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Your Rights and Choices</h2>
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Access and Control</h3>
                <p className="text-muted-foreground mb-4">
                  You have full control over your account information and can access, update, or delete it anytime.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">View Data</span>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Update Profile</span>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Download Data</span>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Delete Account</span>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Content Management</h3>
                <p className="text-muted-foreground">
                  You can edit or delete your posts and comments at any time. Deleted content is
                  removed from public view but may be retained in backups for a limited time.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Communication Preferences</h3>
                <p className="text-muted-foreground">
                  Control email notifications and marketing communications through your account settings.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="space-y-12">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🍪 Cookies and Tracking</h3>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, remember your
                preferences, and analyze usage. You can control cookie settings through your browser.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">📅 Data Retention</h3>
              <p className="text-muted-foreground">
                We retain your information as long as your account is active or as needed to provide
                our services. When you delete your account, we remove your personal information.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🌍 International Data Transfers</h3>
              <p className="text-muted-foreground">
                Your information may be processed in countries other than your own. We ensure
                appropriate safeguards are in place to protect your data.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">👶 Children&apos;s Privacy</h3>
              <p className="text-muted-foreground">
                Our service is not intended for children under 13. We do not knowingly collect
                personal information from children under 13.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-muted-foreground mb-6">
              If you have questions about this privacy policy or our data practices, we&apos;re here to help.
            </p>
            <a
              href="mailto:contact@journly.site?subject=Privacy Policy Question"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Us About Privacy
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
