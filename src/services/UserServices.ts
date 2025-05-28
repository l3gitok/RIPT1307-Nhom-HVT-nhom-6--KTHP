// Interface cho Profile
export interface Profile {
    username: string;
    avatar_url?: string;
    cover_url?: string;
  }
  
  // Interface cho BanInfo
  export interface BanInfo {
    reason: string;
    description: string;
    banned_by: string;
    banned_at: string;
    ban_expires_at: string;
    ban_type: 'direct' | 'report';
    report_id?: string;
  }
  
  // Interface cho Post
  export interface Post {
    _id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  }
  
  // Interface cho Review
  export interface Review {
    _id: string;
    game_name: string;
    rating: number;
    content: string;
    created_at: string;
    updated_at: string;
  }
  
  // Interface cho Comment
  export interface Comment {
    _id: string;
    content: string;
    target_type: string;
    target_id: string;
    created_at: string;
    updated_at: string;
  }
  
  // Interface cho User
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
  
  // Interface cho UserResponse
  export interface UserResponse {
    success: boolean;
    user?: User;
    users?: User[];
    total?: number;
    message?: string;
  }
  
  // Interface cho BanUserFormValues
  export interface BanUserFormValues {
    reason: string;
    description: string;
    ban_expires_at: string;
    ban_type: 'direct' | 'report';
  }
  
  // Interface cho UserQueryParams
  export interface UserQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ascend' | 'descend';
    search?: string;
  } 