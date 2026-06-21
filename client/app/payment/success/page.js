'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchApi } from '@/lib/auth-context';
import { CheckCircle, ArrowLeft, DollarSign, User } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    const confirmPayment = async () => {
      try {
        const data = await fetchApi('/payments/confirm-session', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId }),
        });
        setPayment(data.payment);
      } catch (err) {
        console.error('Error confirming payment:', err);
      } finally {
        setLoading(false);
      }
    };
    confirmPayment();
  }, [sessionId, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your payment has been processed successfully.</p>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            </div>
          ) : payment ? (
            <div className="space-y-3 mb-8">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <DollarSign size={14} /> Amount Paid
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${payment.amount.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <User size={14} /> Freelancer
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{payment.freelancer_email?.split('@')[0]}</p>
              </div>
              {payment.task_id && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Task</div>
                  <p className="font-medium text-gray-900 dark:text-white">{payment.task_id.title}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-8">Payment recorded. Task is now in progress.</p>
          )}

          <Link href="/dashboard/client" className="btn-primary w-full">
            <ArrowLeft size={16} className="mr-2" /> Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
