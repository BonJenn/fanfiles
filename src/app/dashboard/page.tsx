'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { EarningsChart } from '@/components/dashboard/EarningsChart';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { ContentManagement } from '@/components/dashboard/ContentManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { SearchWrapper } from '@/components/common/SearchWrapper';

interface DashboardStats {
  totalEarnings: number;
  totalSubscribers: number;
  totalPosts: number;
  recentViews: number;
}

export default function DashboardPage() {
  return (
    <SearchWrapper>
      <DashboardContent />
    </SearchWrapper>
  );
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    totalSubscribers: 0,
    totalPosts: 0,
    recentViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setError(null);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: stats, error: supabaseError } = await supabase
        .rpc('get_creator_stats', { 
          creator_id: user.id,
          start_date: startOfMonth.toISOString()
        });

      if (supabaseError) throw supabaseError;

      if (stats) {
        setStats({
          totalPosts: stats.total_posts || 0,
          totalSubscribers: stats.total_subscribers || 0,
          totalEarnings: stats.total_earnings || 0,
          recentViews: stats.monthly_views || 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err?.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      fetchDashboardStats();
    }
  }, [user, authLoading, router, fetchDashboardStats]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mt-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-8">
          {error}
        </div>
        <button onClick={fetchDashboardStats}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Earnings"
            value={`$${(stats.totalEarnings / 100).toFixed(2)}`}
            description="Lifetime earnings"
          />
          <StatCard
            title="Subscribers"
            value={stats.totalSubscribers.toString()}
            description="Active subscribers"
          />
          <StatCard
            title="Content"
            value={stats.totalPosts.toString()}
            description="Total posts"
          />
          <StatCard
            title="Recent Views"
            value={stats.recentViews.toString()}
            description="Views this month"
          />
        </div>

        {/* Earnings Chart */}
        <div className="mt-8">
          <EarningsChart userId={user.id} />
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <TransactionsTable userId={user.id} />
          </div>
        </div>

        {/* Content Management */}
        <div className="mt-8">
          <ContentManagement userId={user.id} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description }: { 
  title: string; 
  value: string; 
  description: string; 
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value || '0'}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}
