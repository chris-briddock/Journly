import type { Metadata } from 'next/types';
import Link from 'next/link';
import { ArrowLeft, Users, Target, Heart, Zap } from 'lucide-react';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Journly, our mission to democratize content creation, and the team behind the platform.',
  openGraph: {
    title: 'About Us',
    description: 'Learn about Journly, our mission to democratize content creation, and the team behind the platform.',
    type: 'website',
  },
};

export default function AboutPage() {
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
              About Journly
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering writers and creators to share their stories with the world through 
              a modern, intuitive blogging platform.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <Target className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p>
                At Journly, we believe that everyone has a story worth telling. Our mission is to 
                democratize content creation by providing a powerful, yet simple platform that 
                removes barriers between writers and their audience.
              </p>
              <p>
                We&apos;re building more than just a blogging platform – we&apos;re creating a 
                community where ideas flourish, creativity thrives, and meaningful connections 
                are made through the written word.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community First</h3>
                <p className="text-muted-foreground">
                  We prioritize building a supportive community where writers can grow, 
                  learn, and inspire each other.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously evolve our platform with cutting-edge features that 
                  enhance the writing and reading experience.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Authenticity</h3>
                <p className="text-muted-foreground">
                  We champion authentic voices and original content, fostering an 
                  environment where genuine stories shine.
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p>
                Journly was born from a simple observation: while there are many platforms 
                for sharing content, few truly prioritize the writer&apos;s experience and the 
                reader&apos;s journey. We wanted to create something different.
              </p>
              <p>
                Founded in 2025, Journly combines the best of modern web technology with 
                timeless principles of good storytelling. Our platform features a rich text 
                editor, seamless publishing workflow, and tools that help writers connect 
                with their audience in meaningful ways.
              </p>
              <p>
                Today, Journly serves writers from all walks of life - from personal bloggers 
                sharing their daily experiences to professional journalists crafting in-depth 
                investigations. What unites them all is a passion for the written word and 
                a desire to make their mark on the world.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of writers who have already made Journly their home for sharing stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/posts" 
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Explore Posts
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
