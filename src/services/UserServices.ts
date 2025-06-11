import axios from 'axios';

const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

// ===== EXISTING INTERFACES (giữ nguyên) =====
export interface Profile {
    username: string;
    avatar_url?: string;
    cover_url?: string;
}

export interface BanInfo {
    reason: string;
    description: string;
    banned_by: string;
    banned_at: string;
    ban_expires_at: string;
    ban_type: 'direct' | 'report';
    report_id?: string;
}

export interface Post {
    _id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Review {
    _id: string;
    game_name: string;
    rating: number;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Comment {
    _id: string;
    content: string;
    target_type: string;
    target_id: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    _id: string;
    email: string;
    role: string;
    profile: Profile;
    followers: string[];
    following: string[];
    created_at: string;
    is_verified: boolean;
    status: string;
    ban_info?: BanInfo;
    report_count: number;
    last_reported_at?: string;
    posts?: Post[];
    reviews?: Review[];
    comments?: Comment[];
}

export interface UserResponse {
    success: boolean;
    user?: User;
    users?: User[];
    total?: number;
    message?: string;
}

export interface BanUserFormValues {
    reason: string;
    description: string;
    ban_expires_at: string;
    ban_type: 'direct' | 'report';
}

export interface UserQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ascend' | 'descend';
    search?: string;
}

// ===== SIMPLIFIED FOLLOW INTERFACES =====

// Follow user trong danh sách followers/following
export interface FollowUser {
    _id: string;
    email: string;
    profile: Profile;
    is_verified: boolean;
    role: string;
    status: string;
    created_at: string;
    followers?: string[];
    following?: string[];
}

// Response cho follow/unfollow
export interface FollowResponse {
    success: boolean;
    message: string;
    data?: any;
}

// Response cho danh sách followers/following
export interface FollowListResponse {
    success: boolean;
    data: {
        following?: FollowUser[];
        followers?: FollowUser[];
    };
}

// Response cho follow status
export interface FollowStatusResponse {
    success: boolean;
    data: {
        isFollowing: boolean;
        followedAt?: string;
    };
}

// Response cho follow counts
export interface FollowCountsResponse {
    success: boolean;
    data: {
        followers: number;
        following: number;
    };
}

// ===== EDIT PROFILE INTERFACES =====

export interface EditProfileFormValues {
  username?: string;
  avatar_url?: string;
  cover_url?: string;
}

export interface EditProfileResponse {
  success: boolean;
  message: string;
  user?: User;
}

// ✅ Cloudinary upload response interface
export interface CloudinaryUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    public_id: string;
  };
}

export interface CloudinaryDeleteResponse {
  success: boolean;
  message: string;
}

// =====================================================
// API CALLS
// =====================================================

// ✅ Enhanced toggle follow - return clean result without showing messages
export const toggleFollow = async (targetUserId: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thực hiện thao tác này');
    }

    const response = await axios.post(
      `${API_BASE_URL}/auth/follow/${targetUserId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return {
        success: true,
        isFollowing: response.data.isFollowing,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Không thể thực hiện thao tác');
    }
    
  } catch (error: any) {
    console.error('Toggle follow error:', error);
    
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lỗi từ server');
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server');
    } else {
      throw new Error(error.message || 'Có lỗi xảy ra');
    }
  }
};

// ✅ Send follow notification silently
export const sendFollowNotification = async (targetUserId: string, followerUserId: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await axios.post(
      `${API_BASE_URL}/notifications/follow`,
      {
        targetUserId,
        followerUserId,
        type: 'follow',
        message: 'đã bắt đầu theo dõi bạn'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
    
  } catch (error: any) {
    console.error('Send follow notification error:', error);
    // Don't throw error to prevent disrupting the follow flow
    return { success: false };
  }
};

// ✅ Check follow status
export const checkFollowStatus = async (targetUserId: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return { success: false, isFollowing: false };
    }

    const response = await axios.get(
      `${API_BASE_URL}/auth/follow-status/${targetUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      isFollowing: response.data.isFollowing || false
    };
    
  } catch (error: any) {
    console.error('Check follow status error:', error);
    return { success: false, isFollowing: false };
  }
};

// ✅ Get follow counts
export const getFollowCounts = async (userId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/follow-counts/${userId}`);
    
    return {
      success: true,
      data: {
        followers: response.data.followers || 0,
        following: response.data.following || 0
      }
    };
    
  } catch (error: any) {
    console.error('Get follow counts error:', error);
    return {
      success: false,
      data: { followers: 0, following: 0 }
    };
  }
};

// ... other existing functions ...