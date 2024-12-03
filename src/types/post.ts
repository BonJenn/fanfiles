export interface User {
    id: string;
    name: string;
    avatar: string;
  }
  
  export interface Post {
    id: string;
    url: string;
    type: 'image' | 'video';
    description: string;
    isAccessible: boolean;
    createdAt: string;
    creator: User;
    price?: number;
  }