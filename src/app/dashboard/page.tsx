'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Feed } from '@/components/feed/Feed';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { Analytics } from '@/components/dashboard/Analytics';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
}

interface DashboardStats {
  totalPosts: number;
  totalSubscribers: number;
  totalViews: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalSubscribers: 0,
    totalViews: 0,
    monthlyRevenue: 0
  });
  const [activeTab, setActiveTab] = useState('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setError(null);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No user found');

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Parallel fetch for stats
        const [
          postsResult,
          subscribersResult,
          viewsResult,
          revenueResult
        ] = await Promise.all([
          supabase.from('posts').select('id', { count: 'exact' }).eq('creator_id', user.id),
          supabase.from('subscriptions').select('id', { count: 'exact' }).eq('creator_id', user.id),
          supabase.from('post_views').select('id', { count: 'exact' }).eq('creator_id', user.id),
          supabase.from('transactions')
            .select('amount')
            .eq('creator_id', user.id)
            .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
        ]);

        if (postsResult.error) throw postsResult.error;
        if (subscribersResult.error) throw subscribersResult.error;
        if (viewsResult.error) throw viewsResult.error;
        if (revenueResult.error) throw revenueResult.error;

        const monthlyRevenue = revenueResult.data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

        setProfile(profile);
        setStats({
          totalPosts: postsResult.data?.length || 0,
          totalSubscribers: subscribersResult.data?.length || 0,
          totalViews: viewsResult.data?.length || 0,
          monthlyRevenue
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">Please log in again to access your dashboard.</p>
          <Link href="/login" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-2xl text-gray-500">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600">{profile.bio || 'No bio yet'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Create Post
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Posts</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Subscribers</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalSubscribers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Views</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Revenue</h3>
          <p className="text-3xl font-bold mt-2">${(stats.monthlyRevenue / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['posts', 'subscribers', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'posts' ? (
          <Feed subscribedContent={false} creatorId={profile.id} />
        ) : activeTab === 'subscribers' ? (
          <SubscribersList creatorId={profile.id} />
        ) : (
          <Analytics creatorId={profile.id} />
        )}
      </div>

      {/* Create Post Modal */}
      <Modal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)}>
        <CreatePostForm
          onSuccess={() => {
            setShowCreatePost(false);
            // Refresh the feed
            router.refresh();
          }}
          onCancel={() => setShowCreatePost(false)}
        />
      </Modal>
    </div>
  );
}

// New component for Subscribers List
function SubscribersList({ creatorId }: { creatorId: string }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, profiles(name, avatar_url)')
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubscribers(data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, [creatorId]);

  if (loading) {
    return <div className="text-center py-8">Loading subscribers...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {subscribers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No subscribers yet</div>
      ) : (
        subscribers.map((sub) => (
          <div key={sub.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
              {sub.profiles.avatar_url ? (
                <Image
                  src={sub.profiles.avatar_url}
                  alt={sub.profiles.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-xl text-gray-500">
                    {sub.profiles.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">{sub.profiles.name}</h3>
              <p className="text-sm text-gray-500">
                Subscribed {new Date(sub.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
