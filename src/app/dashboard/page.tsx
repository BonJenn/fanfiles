'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EarningsChart } from '@/components/dashboard/EarningsChart';

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

      // Fetch total earnings
      const { data: earnings } = await supabase
        .from('transactions')
        .select('amount')
        .eq('creator_id', user.id);

      // Fetch subscriber count
      const { count: subscriberCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })
        .eq('creator_id', user.id)
        .eq('status', 'active');

      // Fetch post count
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('creator_id', user.id);

      setStats({
        totalEarnings: earnings?.reduce((sum, t) => sum + t.amount, 0) || 0,
        totalSubscribers: subscriberCount || 0,
        totalPosts: postCount || 0,
        recentViews: 0 // To be implemented
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Add transaction rows here */}
            </tbody>
          </table>
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
