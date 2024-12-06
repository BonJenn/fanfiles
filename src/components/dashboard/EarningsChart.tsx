import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { useAuth } from '@/contexts/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function EarningsChart({ userId }: { userId: string }) {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [{
      label: 'Earnings',
      data: [],
      borderColor: '#000',
      tension: 0.1
    }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.id !== userId) {
      setError('Unauthorized');
      setLoading(false);
      return;
    }

    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: transactions } = await supabase
          .from('transactions')
          .select('created_at, amount')
          .eq('creator_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('created_at');

        // Process data by date
        const dailyEarnings = transactions?.reduce((acc, { created_at, amount }) => {
          const date = new Date(created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + (amount || 0) / 100;
          return acc;
        }, {} as Record<string, number>) || {};

        setChartData({
          labels: Object.keys(dailyEarnings),
          datasets: [{
            label: 'Daily Earnings',
            data: Object.values(dailyEarnings),
            borderColor: '#000',
            tension: 0.1
          }]
        });
      } catch (err: any) {
        console.error('Error fetching earnings data:', err);
        setError(err?.message || 'Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [user, userId, timeframe]);

  if (error === 'Unauthorized') {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        You don't have permission to view these earnings
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.raw as number}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return `$${value}`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Earnings ({timeframe})</h3>
        <div className="flex space-x-2">
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
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
}