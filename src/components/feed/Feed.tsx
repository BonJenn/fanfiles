'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types/post';
import { PostCard } from './PostCard';
import { supabase } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';
import debounce from 'lodash/debounce';
import type { ApiError } from '@/types/error';

interface FeedProps {
  subscribedContent: boolean;
  creatorId?: string;
}

type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low';
type ContentType = 'all' | 'image' | 'video';

export const Feed = ({ subscribedContent, creatorId }: FeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const postsPerPage = 9;

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    delay: 100
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const from = (page - 1) * postsPerPage;
      const to = from + postsPerPage - 1;

      let query = supabase
        .from('posts')
        .select(`
          id,
          url,
          type,
          description,
          price,
          is_public,
          created_at,
          creator_id,
          creator:profiles(id, name, avatar_url)
        `)
        .range(from, to);

      // Apply filters
      if (contentType !== 'all') {
        query = query.eq('type', contentType);
      }

      if (searchQuery) {
        query = query.ilike('description', `%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
      }

      // Apply subscription filter
      if (subscribedContent) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        query = query.eq('creator.subscribed_to', user.id);
      } else if (creatorId) {
        query = query.eq('creator_id', creatorId);
      }

      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;

      setPosts(prev => page === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === postsPerPage);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [subscribedContent, creatorId, sortBy, contentType, searchQuery, page, postsPerPage]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search Bar */}
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="search"
              placeholder="Search posts..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
          </select>

          {/* Content Type Filter */}
          <div className="flex rounded-lg border overflow-hidden">
            {(['all', 'image', 'video'] as ContentType[]).map((type) => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                className={`px-4 py-2 ${
                  contentType === type
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
          <button
            onClick={() => fetchPosts()}
            className="ml-2 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {/* Loading skeletons */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && !loading && <div ref={loadMoreRef} className="h-10" />}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No posts found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};
