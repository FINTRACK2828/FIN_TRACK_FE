import "./globals.css";

export const metadata = {
  title: "FINTRACK – Personal Finance Management System",
  description: "Comprehensive Indian Personal Finance Dashboard: Track income, expenses, budgets, savings goals, and recurring payments.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
