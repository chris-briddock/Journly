import type { Metadata } from 'next/types';
import Link from 'next/link';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle, CheckCircle, XCircle, Scale } from 'lucide-react';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - Journly',
  description: 'Read our terms of service to understand the rules and guidelines for using Journly.',
  openGraph: {
    title: 'Terms of Service - Journly',
    description: 'Read our terms of service to understand the rules and guidelines for using Journly.',
    type: 'website',
  },
};

export default function TermsPage() {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These terms govern your use of Journly. Please read them carefully.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: January 2024
            </p>
          </div>

          {/* Key Points */}
          <div className="bg-muted/50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Key Points</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <Users className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Community Guidelines</h3>
                  <p className="text-sm text-muted-foreground">
                    Be respectful and follow our community standards
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Content Ownership</h3>
                  <p className="text-sm text-muted-foreground">
                    You retain rights to your content while granting us usage rights
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Prohibited Activities</h3>
                  <p className="text-sm text-muted-foreground">
                    Certain activities are not allowed on our platform
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptance of Terms */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Scale className="h-8 w-8 text-primary mr-3" />
              Acceptance of Terms
            </h2>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="text-lg">
                By accessing or using Journly (&quot;the Service&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not
                use our Service.
              </p>
            </div>
          </div>

          {/* Service Description */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <FileText className="h-8 w-8 text-primary mr-3" />
              What is Journly?
            </h2>
            <div className="bg-card border rounded-lg p-6">
              <p className="text-lg text-muted-foreground">
                Journly is a modern blogging platform that empowers users to create, publish, and share
                written content. We provide intuitive tools for writing, editing, and managing blog posts,
                along with features that foster community interaction and engagement.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Users className="h-8 w-8 text-primary mr-3" />
              User Accounts
            </h2>

            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Account Creation</h3>
                <p className="text-muted-foreground mb-4">
                  To use certain features of our Service, you must create an account. By creating an account, you agree to:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-sm">Provide accurate and complete information</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-sm">Maintain the security of your account credentials</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-sm">Notify us immediately of any unauthorized use</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-sm">Be responsible for all activities under your account</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Account Termination</h3>
                <p className="text-muted-foreground">
                  You may terminate your account at any time through your account settings. We may suspend
                  or terminate accounts that violate these Terms or for other legitimate reasons at our discretion.
                </p>
              </div>
            </div>
          </div>

          {/* Content and Conduct */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              Content and Conduct
            </h2>

            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Your Content</h3>
                <p className="text-muted-foreground">
                  You retain ownership of content you create on Journly. By posting content, you grant
                  us a non-exclusive, worldwide, royalty-free license to use, display, and distribute
                  your content on our platform.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-primary">Content Guidelines</h3>
                <p className="text-muted-foreground mb-4">You agree not to post content that:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Violates laws or regulations</span>
                  </div>
                  <div className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Infringes on intellectual property rights</span>
                  </div>
                  <div className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Contains hate speech, harassment, or threats</span>
                  </div>
                  <div className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Includes spam, malware, or deceptive content</span>
                  </div>
                  <div className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Violates privacy or contains personal information</span>
                  </div>
                  <div className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">Is sexually explicit or inappropriate</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">Community Standards</h3>
                <p className="text-green-700 dark:text-green-300">
                  We strive to maintain a respectful community. Users should engage constructively,
                  respect different viewpoints, and contribute positively to discussions.
                </p>
              </div>
            </div>
          </div>

          {/* Prohibited Activities */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <AlertTriangle className="h-8 w-8 text-primary mr-3" />
              Prohibited Activities
            </h2>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
              <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                ⚠️ The following activities are strictly prohibited
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start bg-card border rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Illegal Activities</h3>
                  <p className="text-muted-foreground text-sm">Using our Service for illegal purposes</p>
                </div>
              </div>

              <div className="flex items-start bg-card border rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Unauthorized Access</h3>
                  <p className="text-muted-foreground text-sm">Attempting to gain unauthorized access to our systems</p>
                </div>
              </div>

              <div className="flex items-start bg-card border rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Service Disruption</h3>
                  <p className="text-muted-foreground text-sm">Interfering with or disrupting our Service</p>
                </div>
              </div>

              <div className="flex items-start bg-card border rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Multiple Accounts</h3>
                  <p className="text-muted-foreground text-sm">Creating multiple accounts to evade restrictions</p>
                </div>
              </div>

              <div className="flex items-start bg-card border rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Automated Tools</h3>
                  <p className="text-muted-foreground text-sm">Using automated tools without permission</p>
                </div>
              </div>

              <div className="flex items-start bg-card border rounded-lg p-4">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Impersonation</h3>
                  <p className="text-muted-foreground text-sm">Impersonating others or providing false information</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="space-y-12">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                Intellectual Property
              </h3>
              <p className="text-muted-foreground mb-4">
                Journly and its features are protected by intellectual property laws. We respect intellectual
                property rights and will respond to valid copyright infringement notices.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Platform Protection</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Copyright Policy</span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">DMCA Compliance</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">🔒 Privacy</h3>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium">
                  Privacy Policy
                </Link>{' '}
                to understand how we collect, use, and protect your information.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">⚖️ Disclaimers and Limitations</h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Service Availability:</strong> We strive to maintain high availability but cannot guarantee uninterrupted service.</p>
                <p><strong>Content Disclaimer:</strong> User-generated content does not reflect our views.</p>
                <p><strong>Limitation of Liability:</strong> We are not liable for indirect, incidental, or consequential damages.</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">💳 Subscription and Payments</h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Plans:</strong> We offer both free and paid subscription plans with different features.</p>
                <p><strong>Billing:</strong> Subscription fees are billed in advance and are non-refundable except as required by law.</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">📝 Modifications to Terms</h3>
              <p className="text-muted-foreground">
                We may update these Terms from time to time. We will notify users of significant
                changes. Your continued use constitutes acceptance of updated Terms.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-muted-foreground mb-6">
              If you have questions about these Terms of Service, we&apos;re here to help.
            </p>
            <a
              href="mailto:contact@journly.site?subject=Terms of Service Question"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Us About Terms
            </a>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mt-12">
            <p className="text-sm text-muted-foreground mb-0">
              <strong>Note:</strong> These terms are effective as of January 2024.
              By using Journly, you acknowledge that you have read, understood, and agree
              to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
