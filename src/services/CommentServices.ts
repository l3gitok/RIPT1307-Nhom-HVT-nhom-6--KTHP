import axios from 'axios';

const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

export interface Comment {
  _id: string;
  content: string;
  review_id: string;
  author_id: string;
  author: {
    _id: string;
    email?: string;
    profile?: {
      username?: string;
      avatar_url?: string;
    };
    is_verified?: boolean;
  };
  parent_id?: string | null;
  level?: number;
  status?: string; // ✅ Made optional since we're not filtering by status
  likes?: Array<{
    user_id: string;
    created_at: string;
  }>;
  likes_count?: number;
  reports?: Array<any>;
  reports_count?: number;
  created_at: string;
  updated_at: string;
  // For nested structure
  replies?: Comment[];
}

function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Re-export functions from comment model for backward compatibility
export { 
  getComments, 
  createComment, 
  deleteComment, 
  toggleCommentLike, 
  checkCommentLike,
  countCommentsInTree,
  toggleReviewLike
} from '../models/comment';