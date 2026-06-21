'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, PlusCircle, ListTodo, MessageSquare, Menu, X,
  Send, DollarSign, User, Settings, Shield, History, FileCheck, LogOut, Home,
} from 'lucide-react';

const roleLinks = {
  client: [
    { href: '/dashboard/client', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/client/post-task', label: 'Post a Task', icon: PlusCircle },
    { href: '/dashboard/client/my-tasks', label: 'My Tasks', icon: ListTodo },
    { href: '/dashboard/client/proposals', label: 'Proposals', icon: MessageSquare },
  ],
  freelancer: [
    { href: '/dashboard/freelancer', label: 'Overview', icon: LayoutDashboard },
    { href: '/tasks', label: 'Browse Tasks', icon: ListTodo },
    { href: '/dashboard/freelancer/proposals', label: 'My Proposals', icon: Send },
    { href: '/dashboard/freelancer/active', label: 'Active Projects', icon: FileCheck },
    { href: '/dashboard/freelancer/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/dashboard/freelancer/profile', label: 'Edit Profile', icon: Settings },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Manage Users', icon: User },
    { href: '/dashboard/admin/tasks', label: 'Manage Tasks', icon: ListTodo },
    { href: '/dashboard/admin/transactions', label: 'Transactions', icon: History },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const rolePath = {
        client: '/dashboard/client',
        freelancer: '/dashboard/freelancer',
        admin: '/dashboard/admin',
      };

      const expectedPath = rolePath[user.role];
      if (expectedPath && !pathname.startsWith(expectedPath)) {
        router.push(expectedPath);
        return;
      }
    }
  }, [user, loading, pathname, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const links = roleLinks[user.role] || [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={user.image || 'https://ui-avatars.com/api/?name=User'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Home size={18} /> Home
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <img src={user.image || 'https://ui-avatars.com/api/?name=User'} alt={user.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={18} /> {link.label}
                    </Link>
                  );
                })}
                <button onClick={() => { logout(); setSidebarOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full">
                  <LogOut size={18} /> Logout
                </button>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mb-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu size={20} />
        </button>
        {children}
      </main>
    </div>
  );
}
