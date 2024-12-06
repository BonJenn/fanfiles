'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsProps {
  creatorId: string;
}

export function Analytics({ creatorId }: AnalyticsProps) {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  
  const { data, isLoading, error } = useAnalytics(creatorId, timeframe);

  if (!user || user.id !== creatorId) {
    return <div className="bg-red-50 text-red-500 p-4 rounded-md">
      You don't have permission to view these analytics
    </div>;
  }

  // Rest of your component render logic
}