import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { LockIcon, PlayIcon } from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    url: string;
    type: 'image' | 'video';
    description: string;
    price: number;
    is_public: boolean;
    creator_id: string;
    creator: {
      id: string;
      name: string;
      avatar_url: string;
    };
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(!post.is_public);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/creator/${post.creator_id}`);
  };

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // TODO: Implement Stripe checkout
      console.log('Purchase content:', post.id);
      
    } catch (err) {
      setError('Failed to process purchase. Please try again.');
      console.error('Purchase error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaClick = () => {
    if (!post.is_public) {
      handlePurchase();
      return;
    }
    
    if (post.type === 'video') {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
      {/* Creator Info */}
      <div className="p-3 flex items-center space-x-2 border-b">
        <div 
          onClick={handleCreatorClick}
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={post.creator.avatar_url || '/default-avatar.png'}
              alt={post.creator.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="font-medium text-sm">{post.creator.name}</span>
        </div>
      </div>

      {/* Media Container */}
      <div 
        className="relative aspect-square cursor-pointer group"
        onClick={handleMediaClick}
      >
        {post.type === 'image' ? (
          <Image
            src={post.url}
            alt={post.description}
            fill
            className={`object-cover transition-all duration-200 ${
              isBlurred ? 'blur-xl scale-110' : 'blur-0 scale-100'
            }`}
          />
        ) : (
          <div className="relative w-full h-full">
            {isPlaying ? (
              <video
                src={post.url}
                autoPlay
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Image
                  src={`${post.url}#t=0.1`} // Thumbnail from first frame
                  alt={post.description}
                  fill
                  className={`object-cover transition-all duration-200 ${
                    isBlurred ? 'blur-xl scale-110' : 'blur-0 scale-100'
                  }`}
                />
                <PlayIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-80" />
              </>
            )}
          </div>
        )}

        {/* Premium Content Overlay */}
        {!post.is_public && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <LockIcon className="w-8 h-8 mb-2" />
            <p className="font-medium">${(post.price / 100).toFixed(2)}</p>
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="mt-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="p-3">
        <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
        
        {error && (
          <div className="mt-2 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
