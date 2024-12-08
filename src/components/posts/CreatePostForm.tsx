'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    file: null as File | null,
    type: 'image' as 'image' | 'video',
    title: '',
    description: '',
    price: 0,
    is_public: true
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreview(url);
      // Set type based on file mimetype
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setFormData(prev => ({ ...prev, type }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file with progress tracking
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError, data: _data } = await supabase.storage
        .from('posts')
        .upload(fileName, formData.file, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });

      if (uploadError) throw uploadError;

      // After uploading the file, construct the full URL
      const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts`;
      const fileUrl = `${storageUrl}/${_data.path}`;

      console.log('Constructed file URL:', fileUrl);

      // Create post record with the full URL
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          url: fileUrl,
          type: formData.type,
          description: formData.description,
          price: formData.price,
          is_public: formData.is_public,
          creator_id: user.id
        });

      if (postError) throw postError;

      // Reset form
      setFormData({
        file: null,
        type: 'image',
        title: '',
        description: '',
        price: 0,
        is_public: true
      });
      setPreview(null);
      
      // Call success callback
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Media
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {preview && (
          <div className="mt-2 relative aspect-video w-full">
            {formData.type === 'image' ? (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <video
                src={preview}
                controls
                className="w-full rounded-md"
              />
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            title: e.target.value
          }))}
          className="w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price (0 for free)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            price: parseFloat(e.target.value)
          }))}
          className="w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_public}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              is_public: e.target.checked
            }))}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Make this post public</span>
        </label>
      </div>

      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Create Post'}
      </button>
    </form>
  );
};