import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FinanceTracker - Take Control of Your Financial Future",
  description: "Track expenses, set budgets, and achieve your financial goals with our intelligent finance assistant. Get insights that help you make smarter money decisions.",
  keywords: "finance, budget, expense tracker, financial planning, money management",
  authors: [{ name: "FinanceTracker Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "FinanceTracker - Take Control of Your Financial Future",
    description: "Track expenses, set budgets, and achieve your financial goals with our intelligent finance assistant.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinanceTracker - Take Control of Your Financial Future",
    description: "Track expenses, set budgets, and achieve your financial goals with our intelligent finance assistant.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
