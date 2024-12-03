import { useState } from 'react';
import { Post } from '@/types/post';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isBlurred, setIsBlurred] = useState(!post.isAccessible);

  const handleSubscribe = async () => {
    try {
      // TODO: Implement subscription logic
      setIsBlurred(false); // Temporarily unblur for testing
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <div className="relative aspect-square">
        {post.type === 'image' ? (
          <Image
            src={post.url}
            alt={post.description}
            layout="fill"
            objectFit="cover"
            className={isBlurred ? 'blur-lg' : ''}
          />
        ) : (
          <video
            src={post.url}
            controls
            className={`w-full h-full ${isBlurred ? 'blur-lg' : ''}`}
          />
        )}
        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="bg-primary text-white px-4 py-2 rounded-lg"
              onClick={handleSubscribe}
            >
              Subscribe to View
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600">{post.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src={post.creator.avatar}
              alt={post.creator.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-medium">{post.creator.name}</span>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
