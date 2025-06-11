export interface Review {
  // Các trường cơ bản
  _id: string;
  content: string; // 10-2000 ký tự
  rating: number; // 1-5
  images?: string[]; // URLs hình ảnh (optional)
  game_id: {
    _id: string;
    title: string;
    [key: string]: any;
  } | string; // ✅ Can be populated object or string ID
  author_id: {
    _id: string;
    email?: string;
    profile?: {
      username?: string;
      avatar_url?: string;
    };
    is_verified?: boolean;
    [key: string]: any;
  } | string; // ✅ Can be populated object or string ID
  status: 'pending' | 'approved' | 'rejected';

  // Các trường tương tác
  likes?: {
    user_id: string | { _id: string }; // ✅ Can be ObjectId string or populated User
    created_at: Date | string; // ✅ Can be Date or ISO string
  }[];

  replies?: {
    user_id: string | { _id: string }; // ✅ Can be ObjectId string or populated User
    content: string; // max 500 ký tự
    created_at: Date | string; // ✅ Can be Date or ISO string
  }[];

  // Các trường thống kê
  helpful_count?: number;
  is_featured?: boolean;

  // Timestamps
  created_at: Date | string; // ✅ Can be Date or ISO string
  updated_at: Date | string; // ✅ Can be Date or ISO string

  // Virtual fields (computed by backend)
  likes_count?: number;
  replies_count?: number;

  // ✅ Additional field for comment count if using separate comment system
  comments_count?: number;

  // Additional fields
  [key: string]: any;
}

// Interface cho việc tạo review mới
export interface CreateReviewDTO {
  content: string;
  rating: number;
  images?: string[];
  game_id: string;
}

// Interface cho việc cập nhật review
export interface UpdateReviewDTO {
  content?: string;
  rating?: number;
  images?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  is_featured?: boolean;
}

// Interface cho việc thêm reply (if using backend replies system)
export interface AddReplyDTO {
  content: string;
}

// Interface cho việc like review
export interface LikeReviewDTO {
  user_id: string;
}

// ✅ Response interfaces for API calls
export interface ReviewResponse {
  success: boolean;
  data: Review;
  message?: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    total: number;
    page?: number;
    limit?: number;
  };
  message?: string;
}

export interface LikeResponse {
  success: boolean;
  data: {
    liked: boolean;
    likes_count: number;
  };
  message?: string;
}