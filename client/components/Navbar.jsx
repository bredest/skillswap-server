'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Menu, X, Sun, Moon, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  const dashboardPath = user?.role === 'client' ? '/dashboard/client' : user?.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/admin';

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/tasks', label: 'Browse Tasks' },
    { href: '/freelancers', label: 'Browse Freelancers' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  pathname === link.href ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardPath} className="btn-primary text-sm px-4 py-2">
                  <LayoutDashboard size={16} className="mr-1.5" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <img src={user.image || 'https://ui-avatars.com/api/?name=User'} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-medium hidden lg:inline">{user.name}</span>
                </div>
                <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm px-4 py-2">
                Login
              </Link>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
          >
            <div className="px-4 py-4 space-y-3">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 py-2"
                >
                  {link.label}
                </Link>
              ))}
              <button onClick={toggleDarkMode} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-2">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
                  <Link href={dashboardPath} onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center text-sm">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="btn-secondary w-full justify-center text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center text-sm">
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
