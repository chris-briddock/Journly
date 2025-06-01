import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="text-xl font-bold font-serif">
                Journly
              </Link>
              <p className="text-muted-foreground mt-2 text-sm">
                Where good ideas find you.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/posts" className="text-muted-foreground hover:text-foreground transition-colors">
                    Explore Posts
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/posts/new" className="text-muted-foreground hover:text-foreground transition-colors">
                    Write a Post
                  </Link>
                </li>
                <li>
                  <Link href="/subscription" className="text-muted-foreground hover:text-foreground transition-colors">
                    Become a Member
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:contact@journly.site" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Journly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
