import axios from 'axios';
import { Comment } from '../services/CommentServices';

const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Get comments for a review with nested replies
export async function getComments(reviewId: string): Promise<Comment[]> {
  try {
    console.log('🔍 Fetching comments for reviewId:', reviewId);
    
    // ✅ Simplified URL without query parameters
    const url = `${API_BASE_URL}/comments/review/${reviewId}`;
    console.log('🌐 Request URL:', url);
    
    const headers = getAuthHeader();
    console.log('🔑 Request headers:', headers);
    
    const response = await axios.get(url, { headers });
    
    console.log('📡 Full API response:', response);
    console.log('📋 Response status:', response.status);
    console.log('📄 Response data:', response.data);
    
    // ✅ Handle multiple response formats from backend
    let comments: Comment[] = [];
    
    if (response.data) {
      if (response.data.success && response.data.data) {
        // Format: { success: true, data: [...] } or { success: true, data: { comments: [...] } }
        if (Array.isArray(response.data.data)) {
          comments = response.data.data;
          console.log('📝 Found comments in data array:', comments.length);
        } else if (response.data.data.comments && Array.isArray(response.data.data.comments)) {
          comments = response.data.data.comments;
          console.log('📝 Found comments in data.comments:', comments.length);
        }
      } else if (Array.isArray(response.data)) {
        // Format: [...]
        comments = response.data;
        console.log('📝 Found comments in direct array format:', comments.length);
      } else if (response.data.comments && Array.isArray(response.data.comments)) {
        // Format: { comments: [...] }
        comments = response.data.comments;
        console.log('📝 Found comments in comments field:', comments.length);
      } else {
        console.log('❌ No valid comments array found in response');
      }
    }
    
    console.log('🏗️ Building comment tree from', comments.length, 'flat comments');
    
    // ✅ No status filtering - show all comments
    const nestedComments = buildCommentTree(comments);
    console.log('🌳 Built nested comments:', nestedComments);
    
    return nestedComments;
    
  } catch (error: any) {
    console.error('💥 Error fetching comments:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return [];
  }
}

// Build nested comment tree from flat array
function buildCommentTree(flatComments: Comment[]): Comment[] {
  console.log('🌲 Building tree from', flatComments.length, 'comments');
  
  // ✅ Check if comments are already nested
  const rootComments = flatComments.filter(comment => !comment.parent_id);
  const replyComments = flatComments.filter(comment => comment.parent_id);
  
  console.log('🌱 Root comments:', rootComments.length);
  console.log('💬 Reply comments:', replyComments.length);
  
  // If all comments are root comments and some have replies, they're pre-nested
  if (replyComments.length === 0 && rootComments.some(c => c.replies && c.replies.length > 0)) {
    console.log('🎯 Comments appear to be pre-nested by backend');
    return rootComments;
  }
  
  const commentMap = new Map<string, Comment>();
  const finalRootComments: Comment[] = [];

  // First pass: create map of all comments with empty replies array
  flatComments.forEach(comment => {
    commentMap.set(comment._id, { ...comment, replies: [] });
  });

  console.log('📋 Created comment map with', commentMap.size, 'entries');

  // Second pass: build tree structure
  flatComments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment._id)!;
    
    if (comment.parent_id) {
      // This is a reply, add to parent's replies
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
        console.log(`📎 Added reply ${comment._id} to parent ${comment.parent_id}`);
      } else {
        console.log(`⚠️ Parent ${comment.parent_id} not found for reply ${comment._id}`);
        // Add orphaned reply as root comment
        finalRootComments.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      finalRootComments.push(commentWithReplies);
      console.log(`🌱 Added root comment ${comment._id}`);
    }
  });

  console.log('🎄 Final tree has', finalRootComments.length, 'root comments');
  return finalRootComments;
}

// Create a new comment or reply
export async function createComment(reviewId: string, content: string, parentId?: string | null): Promise<Comment | null> {
  try {
    console.log('✍️ Creating comment:', { reviewId, content, parentId });
    
    const payload = {
      review_id: reviewId,
      content,
      ...(parentId && { parent_id: parentId })
    };
    
    console.log('📤 Request payload:', payload);
    
    const response = await axios.post(`${API_BASE_URL}/comments`, payload, {
      headers: getAuthHeader()
    });
    
    console.log('📨 Create comment response:', response);
    console.log('📋 Response status:', response.status);
    console.log('📄 Response data:', response.data);
    
    // ✅ Simplified success handling - if HTTP status is success, consider it successful
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Comment created successfully');
      
      // Try to extract comment data, but don't fail if format is unexpected
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data?._id) {
        return response.data;
      }
      
      // Even if we can't extract the comment object, creation was successful
      return null;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('💥 Error creating comment:', error);
    
    if (error.response) {
      console.error('Server error response:', error.response.data);
      throw error;
    } else if (error.request) {
      console.error('Network error:', error.request);
      throw new Error('Lỗi kết nối mạng');
    } else {
      console.error('Other error:', error.message);
      throw error;
    }
  }
}

// Count total comments in a tree structure
export function countCommentsInTree(comments: Comment[]): number {
  let count = 0;
  comments.forEach(comment => {
    count++; // Count the comment itself
    if (comment.replies && comment.replies.length > 0) {
      count += countCommentsInTree(comment.replies); // Recursively count replies
    }
  });
  return count;
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
      headers: getAuthHeader()
    });
    
    // ✅ Consider any 2xx status as success
    if (response.status >= 200 && response.status < 300) {
      return true;
    }
    
    return response.data?.success || false;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}

// Like/Unlike a comment
export async function toggleCommentLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/like`, {}, {
      headers: getAuthHeader()
    });
    
    console.log('Toggle like response:', response.data);
    
    // ✅ Handle various response formats
    const responseData = response.data?.success ? response.data.data : response.data;
    return {
      liked: Boolean(responseData?.liked),
      likesCount: Number(responseData?.likesCount || responseData?.likes_count) || 0
    };
  } catch (error: any) {
    console.error('Error toggling comment like:', error);
    throw new Error(error.response?.data?.message || 'Không thể thích/bỏ thích bình luận');
  }
}

// Check if user liked a comment
export async function checkCommentLike(commentId: string): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/comments/${commentId}/like-status`, {
      headers: getAuthHeader()
    });
    
    const responseData = response.data?.success ? response.data.data : response.data;
    return Boolean(responseData?.liked);
  } catch (error) {
    console.error('Error checking comment like status:', error);
    return false;
  }
}

// Review-related functions
export async function toggleReviewLike(reviewId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    console.log('🔄 Toggling review like for reviewId:', reviewId);
    
    const response = await axios.post(`${API_BASE_URL}/reviews/${reviewId}/like`, {}, {
      headers: getAuthHeader()
    });
    
    console.log('❤️ Toggle review like response:', response);
    console.log('📄 Response data:', response.data);
    console.log('📄 Response status:', response.status);
    
    // ✅ Handle different response formats more carefully
    if (response.status >= 200 && response.status < 300) {
      let result = { liked: false, likesCount: 0 };
      
      if (response.data?.success && response.data?.data) {
        // Format: { success: true, data: { liked: boolean, likes_count: number } }
        console.log('✅ Success format with data field');
        result = {
          liked: Boolean(response.data.data.liked),
          likesCount: Number(response.data.data.likes_count || response.data.data.likesCount) || 0
        };
      } else if (response.data?.liked !== undefined) {
        // Format: { liked: boolean, likes_count: number }
        console.log('✅ Direct format');
        result = {
          liked: Boolean(response.data.liked),
          likesCount: Number(response.data.likes_count || response.data.likesCount) || 0
        };
      } else {
        // ✅ If no specific format, make another request to get current status
        console.log('⚠️ Unexpected response format, fetching review to check status');
        try {
          const reviewResponse = await axios.get(`${API_BASE_URL}/reviews/${reviewId}`, {
            headers: getAuthHeader()
          });
          
          const reviewData = reviewResponse.data?.success ? reviewResponse.data.data : reviewResponse.data;
          if (reviewData) {
            result = {
              liked: Array.isArray(reviewData.likes) && reviewData.likes.some((like: any) => {
                const likeUserId = typeof like.user_id === 'string' ? like.user_id : like.user_id?._id;
                const currentUserId = getCurrentUserId(); // You'll need to implement this
                return likeUserId === currentUserId;
              }),
              likesCount: reviewData.likes_count || (Array.isArray(reviewData.likes) ? reviewData.likes.length : 0)
            };
          }
        } catch (fetchError) {
          console.error('Failed to fetch review for status check:', fetchError);
          // Return a neutral result if we can't determine the status
          result = { liked: true, likesCount: 0 }; // Assume like action was successful
        }
      }
      
      console.log('🎯 Final result:', result);
      return result;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('💥 Error toggling review like:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    // ✅ Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Vui lòng đăng nhập để thích bài viết');
    } else if (error.response?.status === 404) {
      throw new Error('Không tìm thấy bài viết');
    } else if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    } else {
      throw new Error(error.response?.data?.message || 'Không thể thích/bỏ thích bài viết');
    }
  }
}

// ✅ Helper function to get current user ID
function getCurrentUserId(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    // Simple JWT decode (you might want to use a library for this)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload.sub || null;
  } catch (error) {
    console.error('Error getting current user ID from token:', error);
    return null;
  }
}