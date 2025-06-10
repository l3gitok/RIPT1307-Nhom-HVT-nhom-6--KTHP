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