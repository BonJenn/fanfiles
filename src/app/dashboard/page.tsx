'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EarningsChart } from '@/components/dashboard/EarningsChart';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { ContentManagement } from '@/components/dashboard/ContentManagement';

interface DashboardStats {
  totalEarnings: number;
  totalSubscribers: number;
  totalPosts: number;
  recentViews: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    totalSubscribers: 0,
    totalPosts: 0,
    recentViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      setUser(user);

      // Get the start of the current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        { count: totalPosts },
        { count: totalSubscribers },
        { data: earnings },
        { count: monthlyViews }
      ] = await Promise.all([
        // Get total posts
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id),
        
        // Get total subscribers
        supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id),
        
        // Get total earnings
        supabase
          .from('transactions')
          .select('amount')
          .eq('creator_id', user.id),
        
        // Get views this month
        supabase
          .from('post_views')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id)
          .gte('created_at', startOfMonth.toISOString())
      ]);

      const totalEarnings = earnings?.reduce((sum, transaction) => 
        sum + (transaction.amount || 0), 0) || 0;

      setStats({
        totalPosts: totalPosts || 0,
        totalSubscribers: totalSubscribers || 0,
        totalEarnings,
        recentViews: monthlyViews || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return (
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
