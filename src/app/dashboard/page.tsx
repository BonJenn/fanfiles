'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Feed } from '@/components/feed/Feed';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { Modal } from '@/components/ui/Modal';

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'subscribers' | 'analytics'>('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch stats
        const { data: postsCount } = await supabase
          .from('posts')
          .select('id', { count: 'exact' })
          .eq('creator_id', user.id);

        const { data: subscribersCount } = await supabase
          .from('subscriptions')
          .select('id', { count: 'exact' })
          .eq('creator_id', user.id);

        const { data: viewsCount } = await supabase
          .from('post_views')
          .select('id', { count: 'exact' })
          .eq('creator_id', user.id);

        const { data: revenue } = await supabase
          .from('transactions')
          .select('amount')
          .eq('creator_id', user.id)
          .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

        const monthlyRevenue = revenue?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

        setProfile(profile);
        setStats({
          totalPosts: postsCount?.length || 0,
          totalSubscribers: subscribersCount?.length || 0,
          totalViews: viewsCount?.length || 0,
          monthlyRevenue
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  const StatCard = ({ title, value, description }: { title: string; value: string | number; description: string }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-500 text-sm uppercase">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
    </div>
  );

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchProfileAndStats(); // Refresh stats
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Please log in</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24">
            <Image
              src={profile.avatar_url || '/default-avatar.png'}
              alt={profile.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
                <p className="mt-2">{profile.bio || 'No bio yet'}</p>
              </div>
              <button
                onClick={() => router.push('/settings')}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          description="Content pieces created"
        />
        <StatCard
          title="Subscribers"
          value={stats.totalSubscribers}
          description="Active subscribers"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews}
          description="Content views this month"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          description="Earnings this month"
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center border-b mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-4 ${
              activeTab === 'posts'
                ? 'border-b-2 border-black font-medium'
                : 'text-gray-500'
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-4 ${
              activeTab === 'subscribers'
                ? 'border-b-2 border-black font-medium'
                : 'text-gray-500'
            }`}
          >
            My Subscribers
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 ${
              activeTab === 'analytics'
                ? 'border-b-2 border-black font-medium'
                : 'text-gray-500'
            }`}
          >
            Analytics
          </button>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Create Post
        </button>
      </div>

      {/* Content */}
      {activeTab === 'posts' ? (
        <Feed subscribedContent={false} creatorId={profile.id} />
      ) : activeTab === 'subscribers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Subscriber list will go here */}
          <p>Subscriber feature coming soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analytics content will go here */}
          <p>Analytics feature coming soon</p>
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        title="Create New Post"
      >
        <CreatePostForm onSuccess={handlePostCreated} />
      </Modal>
    </div>
  );
}
