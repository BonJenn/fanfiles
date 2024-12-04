import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Creator {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  url: string;
  type: 'image' | 'video';
  description: string;
  price: number;
  is_public: boolean;
  created_at: string;
  creator_id: string;
  creator: Creator;
}

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(!post.is_public);

  const handleCreatorClick = () => {
    router.push(`/creator/${post.creator_id}`);
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // TODO: Implement Stripe subscription
      console.log('Subscribe to creator:', post.creator_id);
      
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
      {/* Media Container */}
      <div className="relative aspect-square">
        {post.type === 'image' ? (
          <Image
            src={post.url}
            alt={post.description || 'Post image'}
            fill
            className={`object-cover transition-all duration-200 ${
              isBlurred ? 'blur-lg' : ''
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <video
            src={post.url}
            controls={!isBlurred}
            className={`w-full h-full object-cover ${
              isBlurred ? 'blur-lg' : ''
            }`}
          />
        )}
        
        {/* Overlay for private content */}
        {isBlurred && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
            <p className="text-lg font-semibold mb-2">
              Subscribe to view this content
            </p>
            <p className="text-sm mb-4">${post.price}/month</p>
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </button>
            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="p-4">
        <p className="text-gray-700 mb-3 line-clamp-2">
          {post.description}
        </p>
        
        {/* Creator Info */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleCreatorClick}
            className="flex items-center space-x-2 hover:opacity-75"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={post.creator.avatar_url || '/default-avatar.png'}
                alt={post.creator.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium">{post.creator.name}</span>
          </button>
          
          <time
            dateTime={post.created_at}
            className="text-sm text-gray-500"
          >
            {new Date(post.created_at).toLocaleDateString()}
          </time>
        </div>
      </div>
    </div>
  );
};
