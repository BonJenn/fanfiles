'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsProps {
  creatorId: string;
}

export function Analytics({ creatorId }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    dates: string[];
    views: number[];
    revenue: number[];
    subscribers: number[];
  }>({ dates: [], views: [], revenue: [], subscribers: [] });

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, creatorId, fetchAnalytics]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [viewsData, revenueData, subscribersData] = await Promise.all([
        supabase
          .from('post_views')
          .select('created_at')
          .eq('creator_id', creatorId)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('creator_id', creatorId)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('subscriptions')
          .select('created_at')
          .eq('creator_id', creatorId)
          .gte('created_at', startDate.toISOString())
      ]);

      // Process data for chart
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyStats = dates.reduce((acc, date) => {
        acc[date] = { views: 0, revenue: 0, subscribers: 0 };
        return acc;
      }, {} as Record<string, { views: number; revenue: number; subscribers: number }>);

      // Process views
      viewsData.data?.forEach(view => {
        const date = new Date(view.created_at).toISOString().split('T')[0];
        if (dailyStats[date]) dailyStats[date].views++;
      });

      // Process revenue
      revenueData.data?.forEach(transaction => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        if (dailyStats[date]) dailyStats[date].revenue += transaction.amount;
      });

      // Process subscribers
      subscribersData.data?.forEach(sub => {
        const date = new Date(sub.created_at).toISOString().split('T')[0];
        if (dailyStats[date]) dailyStats[date].subscribers++;
      });

      setData({
        dates,
        views: dates.map(date => dailyStats[date].views),
        revenue: dates.map(date => dailyStats[date].revenue / 100), // Convert cents to dollars
        subscribers: dates.map(date => dailyStats[date].subscribers)
      });
    } catch (error: Error) {
      setError(error.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [timeframe, creatorId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading analytics: {error}
      </div>
    );
  }

  const chartData = {
    labels: data.dates.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Views',
        data: data.views,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Revenue ($)',
        data: data.revenue,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      },
      {
        label: 'New Subscribers',
        data: data.subscribers,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        {(['7d', '30d', '90d'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-3 py-1 rounded-md ${
              timeframe === t
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Performance Overview' }
            },
            scales: { y: { beginAtZero: true } }
          }}
        />
      </div>
    </div>
  );
}