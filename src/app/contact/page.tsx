import type { Metadata } from 'next/types';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, HelpCircle, Bug, Lightbulb } from 'lucide-react';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Journly team. We\'re here to help with questions, feedback, and support.',
  openGraph: {
    title: 'Contact Us',
    description: 'Get in touch with the Journly team. We\'re here to help with questions, feedback, and support.',
    type: 'website',
  },
};

export default function ContactPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Email Contact */}
            <div className="bg-card border rounded-lg p-8 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Email Us</h2>
              <p className="text-muted-foreground mb-6">
                For general inquiries, support, or feedback, drop us an email and we&apos;ll get back to you.
              </p>
              <a 
                href="mailto:contact@journly.site"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Mail className="mr-2 h-4 w-4" />
                contact@journly.site
              </a>
            </div>

            {/* Community */}
            <div className="bg-card border rounded-lg p-8 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Join the Community</h2>
              <p className="text-muted-foreground mb-6">
                Connect with other writers, share tips, and get help from the community.
              </p>
              <Link 
                href="/posts"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Explore Community
              </Link>
            </div>
          </div>

          {/* Contact Reasons */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">What can we help you with?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <HelpCircle className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">General Support</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Questions about using Journly, account issues, or general help.
                </p>
                <a 
                  href="mailto:contact@journly.site?subject=General Support"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Get Support →
                </a>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Bug className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Bug Reports</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Found a bug or technical issue? Let us know so we can fix it.
                </p>
                <a 
                  href="mailto:contact@journly.site?subject=Bug Report"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Report Bug →
                </a>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Feature Requests</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Have an idea for a new feature? We&apos;d love to hear your suggestions.
                </p>
                <a 
                  href="mailto:contact@journly.site?subject=Feature Request"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Suggest Feature →
                </a>
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Response Time</h2>
            <p className="text-muted-foreground mb-4">
              We typically respond to emails within 24-48 hours during business days. 
              For urgent issues, please mark your email as &quot;Urgent&quot; in the subject line.
            </p>
            <p className="text-sm text-muted-foreground">
              Business hours: Monday - Friday, 9:00 AM - 6:00 PM (UTC)
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
