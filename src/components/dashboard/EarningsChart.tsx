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
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [{
      label: 'Earnings',
      data: [],
      borderColor: '#000',
      tension: 0.1
    }]
  });

  useEffect(() => {
    const fetchEarningsData = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('creator_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      // Process data for chart
      const dailyEarnings = transactions?.reduce((acc: Record<string, number>, transaction) => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + transaction.amount;
        return acc;
      }, {}) || {};

      setChartData({
        labels: Object.keys(dailyEarnings),
        datasets: [{
          label: 'Daily Earnings',
          data: Object.values(dailyEarnings).map(amount => amount / 100),
          borderColor: '#000',
          tension: 0.1
        }]
      });
    };

    fetchEarningsData();
  }, [userId]);

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
      <h3 className="text-lg font-medium mb-4">Earnings (Last 30 Days)</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}