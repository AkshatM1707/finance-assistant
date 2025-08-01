import Link from "next/link";
import Card from "../components/ui/Card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className="border-b border-border sticky top-0 z-50"
        style={{
          backgroundColor: "hsl(var(--navbar-bg))",
          color: "hsl(var(--navbar-foreground))",
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                F
              </span>
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: "hsl(var(--navbar-foreground))" }}
            >
              FinanceTracker
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="hover:bg-black/10 px-3 py-2 rounded-md transition-colors"
              style={{ color: "hsl(var(--navbar-foreground))" }}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Take Control of Your
            <span className="text-primary"> Financial Future</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Track expenses, set budgets, and achieve your financial goals with
            our intelligent finance assistant. Upload receipts, analyze spending
            patterns, and get insights that help you make smarter money
            decisions.
          </p>
          <div className="flex justify-center mt-8">
  <Link
    href="/login"
    className="border-2 border-border text-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:border-primary hover:text-primary transition-all duration-200"
  >
    Sign In
  </Link>
</div>

        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you take control of your
              finances
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card
              hover
              className="p-8 bg-white shadow-md border border-gray-200"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Smart Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get detailed insights into your spending patterns and financial
                health with AI-powered analytics and visual charts.
              </p>
            </Card>

            <Card
              hover
              className="p-8 bg-white shadow-md border border-gray-200"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Receipt Processing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Upload receipts and automatically extract transaction data.
                Supports images and PDFs with intelligent OCR technology.
              </p>
            </Card>

            <Card
              hover
              className="p-8 bg-white shadow-md border border-gray-200"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level security ensures your financial data is always
                protected and private. Your data never leaves your control.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of users who are already taking control of their
            financial future.
          </p>
          <Link
  href="/register"
  className="bg-foreground text-background px-8 py-4 rounded-xl text-lg font-semibold hover:bg-foreground/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
>
  Get Started Today
</Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-muted">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                F
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">
              FinanceTracker
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 FinanceTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
