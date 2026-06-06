import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'ClaimVision AI — Car Damage Assessment',
  description: 'AI-powered car insurance claims assessment platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100">
        {/* Top navigation bar */}
        <nav className="bg-[#0f2340] text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
            {/* Logo — clicking takes you back to new claim */}
            <Link href="/claims/new" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center font-bold text-sm">
                CV
              </div>
              <div>
                <span className="font-semibold text-lg tracking-tight">ClaimVision</span>
                <span className="ml-2 text-blue-300 text-sm font-normal">AI Claims Platform</span>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-3 text-sm text-slate-300">
              <span>Claims Agent Portal</span>
              <div className="flex items-center gap-2 bg-[#1e3a5f] rounded-full px-3 py-1">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                  D
                </div>
                <span className="text-xs text-slate-200">demo_user</span>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
