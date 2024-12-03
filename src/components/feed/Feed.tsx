import { useState, useEffect } from 'react';
import { Post } from '@/types/post';
import { PostCard } from './PostCard';
import { supabase } from '@/lib/supabase';

interface FeedProps {
  subscribedContent: boolean;
}

export const Feed = ({ subscribedContent }: FeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('posts')
          .select(`
            *,
            creator:users(id, name, avatar)
          `);

        if (subscribedContent) {
          const { data: { user } } = await supabase.auth.getUser();
          query = query.eq('creator.subscribed_to', user?.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [subscribedContent]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
