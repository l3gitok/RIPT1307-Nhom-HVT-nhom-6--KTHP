import axios from 'axios';
import type { Review } from '../services/ReviewServices';

const API_URL = 'https://gamehubapi-test.onrender.com/api/reviews';

function getAuthHeader() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchReviews(params?: {
    page?: number;
    limit?: number;
    gameId?: string;
    userId?: string;
    status?: string;
}): Promise<{ reviews: Review[]; pagination: any }> {
    try {
        const queryParams: any = {
            page: params?.page || 1,
            limit: params?.limit || 10,
        };

        // Add filters
        if (params?.gameId) queryParams.game_id = params.gameId;
        if (params?.userId) queryParams.author_id = params.userId;
        if (params?.status) queryParams.status = params.status;

        const response = await axios.get(API_URL, { 
            params: queryParams,
            headers: getAuthHeader()
        });

        // Check if response has the expected structure
        let reviews: Review[] = [];
        let pagination = {
            total: 0,
            totalPages: 1,
            currentPage: 1,
        };

        if (response.data) {
            // Handle different response structures
            if (response.data.success && response.data.data) {
                // Structure: { success: true, data: { reviews: [...], total: ... } }
                reviews = Array.isArray(response.data.data.reviews) ? response.data.data.reviews : [];
                pagination = {
                    total: response.data.data.total || 0,
                    totalPages: response.data.data.totalPages || 1,
                    currentPage: response.data.data.currentPage || 1,
                };
            } else if (Array.isArray(response.data.reviews)) {
                // Structure: { reviews: [...], total: ... }
                reviews = response.data.reviews;
                pagination = {
                    total: response.data.total || 0,
                    totalPages: response.data.totalPages || 1,
                    currentPage: response.data.currentPage || 1,
                };
            } else if (Array.isArray(response.data)) {
                // Structure: [review1, review2, ...]
                reviews = response.data;
            }
        }

        // Calculate and save stats
        calculateAndSaveReviewStats(reviews);

        return { reviews, pagination };
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        
        // Log more detailed error info
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        return { reviews: [], pagination: { total: 0, totalPages: 1, currentPage: 1 } };
    }
}

// ✅ Fix fetchReviewsByUser to use the correct endpoint
export async function fetchReviewsByUser(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
}): Promise<{ reviews: Review[]; pagination: any }> {
    try {
        // Use the main reviews endpoint with author_id filter instead
        const queryParams: any = {
            page: params?.page || 1,
            limit: params?.limit || 10,
            author_id: userId, // ✅ Use author_id instead of separate endpoint
        };

        if (params?.status) queryParams.status = params.status;

        const response = await axios.get(API_URL, { 
            params: queryParams,
            headers: getAuthHeader() 
        });

        let reviews: Review[] = [];
        let pagination = {
            total: 0,
            totalPages: 1,
            currentPage: 1,
        };

        if (response.data) {
            if (response.data.success && response.data.data) {
                reviews = Array.isArray(response.data.data.reviews) ? response.data.data.reviews : [];
                pagination = {
                    total: response.data.data.total || 0,
                    totalPages: response.data.data.totalPages || 1,
                    currentPage: response.data.data.currentPage || 1,
                };
            } else if (Array.isArray(response.data.reviews)) {
                reviews = response.data.reviews;
                pagination = {
                    total: response.data.total || 0,
                    totalPages: response.data.totalPages || 1,
                    currentPage: response.data.currentPage || 1,
                };
            } else if (Array.isArray(response.data)) {
                reviews = response.data;
            }
        }

        return { reviews, pagination };
    } catch (error: any) {
        console.error('Error fetching user reviews:', error);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request params:', error.config?.params);
        }
        
        return { reviews: [], pagination: { total: 0, totalPages: 1, currentPage: 1 } };
    }
}

// ✅ Fix fetchMyReviews to use the correct endpoint
export async function fetchMyReviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
}): Promise<{ reviews: Review[]; pagination: any }> {
    try {
        // Check if user has a specific "my reviews" endpoint or use the main endpoint
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn('No access token found');
            return { reviews: [], pagination: { total: 0, totalPages: 1, currentPage: 1 } };
        }

        const queryParams: any = {
            page: params?.page || 1,
            limit: params?.limit || 10,
        };

        if (params?.status) queryParams.status = params.status;

        // Try the "my reviews" endpoint first
        let response;
        try {
            response = await axios.get(`${API_URL}/my`, { 
                params: queryParams,
                headers: getAuthHeader() 
            });
        } catch (myReviewsError: any) {
            // If "my reviews" endpoint doesn't exist, fallback to main endpoint
            if (myReviewsError.response?.status === 404) {
                console.log('My reviews endpoint not found, using main endpoint');
                response = await axios.get(API_URL, { 
                    params: queryParams,
                    headers: getAuthHeader() 
                });
            } else {
                throw myReviewsError;
            }
        }

        let reviews: Review[] = [];
        let pagination = {
            total: 0,
            totalPages: 1,
            currentPage: 1,
        };

        if (response.data) {
            if (response.data.success && response.data.data) {
                reviews = Array.isArray(response.data.data.reviews) ? response.data.data.reviews : [];
                pagination = {
                    total: response.data.data.total || 0,
                    totalPages: response.data.data.totalPages || 1,
                    currentPage: response.data.data.currentPage || 1,
                };
            } else if (Array.isArray(response.data.reviews)) {
                reviews = response.data.reviews;
                pagination = {
                    total: response.data.total || 0,
                    totalPages: response.data.totalPages || 1,
                    currentPage: response.data.currentPage || 1,
                };
            } else if (Array.isArray(response.data)) {
                reviews = response.data;
            }
        }

        return { reviews, pagination };
    } catch (error: any) {
        console.error('Error fetching my reviews:', error);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        return { reviews: [], pagination: { total: 0, totalPages: 1, currentPage: 1 } };
    }
}

export async function updateReviewStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Review> {
    const response = await axios.patch(
        `${API_URL}/${id}/status`,
        { status },
        { headers: getAuthHeader() },
    );
    
    await refreshReviewStats();
    return response.data.data;
}

function calculateAndSaveReviewStats(reviews: Review[]) {
    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(review => review.status === 'pending').length;
    const approvedReviews = reviews.filter(review => review.status === 'approved').length;
    const rejectedReviews = reviews.filter(review => review.status === 'rejected').length;

    localStorage.setItem('totalReviews', totalReviews.toString());
    localStorage.setItem('pendingReviews', pendingReviews.toString());
    localStorage.setItem('approvedReviews', approvedReviews.toString());
    localStorage.setItem('rejectedReviews', rejectedReviews.toString());
}

export function getReviewStatsFromStorage() {
    return {
        totalReviews: parseInt(localStorage.getItem('totalReviews') || '0', 10),
        pendingReviews: parseInt(localStorage.getItem('pendingReviews') || '0', 10),
        approvedReviews: parseInt(localStorage.getItem('approvedReviews') || '0', 10),
        rejectedReviews: parseInt(localStorage.getItem('rejectedReviews') || '0', 10),
    };
}

async function refreshReviewStats() {
    try {
        const { reviews } = await fetchReviews();
        calculateAndSaveReviewStats(reviews);
    } catch (error) {
        console.error('Error refreshing review stats:', error);
    }
}

// ✅ Add createReview function to models/review.ts
export async function createReview(reviewData: {
    game_id: string;
    content: string;
    rating: number;
    images?: string[];
}): Promise<Review> {
    try {
        console.log('Sending review data:', reviewData);
        
        const response = await axios.post(API_URL, reviewData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        console.log('Create review response:', response.data);

        // Handle different response structures
        let createdReview: Review;
        if (response.data.success && response.data.data) {
            createdReview = response.data.data;
        } else if (response.data.review) {
            createdReview = response.data.review;
        } else {
            createdReview = response.data;
        }

        // Refresh stats after creating
        await refreshReviewStats();

        return createdReview;
    } catch (error: any) {
        console.error('Error creating review:', error);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            
            // Handle specific error messages
            if (error.response.status === 400) {
                throw new Error(error.response.data.message || 'Dữ liệu không hợp lệ');
            } else if (error.response.status === 401) {
                throw new Error('Vui lòng đăng nhập để đăng bài');
            } else if (error.response.status === 403) {
                throw new Error('Bạn không có quyền thực hiện hành động này');
            } else if (error.response.status === 429) {
                throw new Error('Bạn đang đăng bài quá nhanh, vui lòng thử lại sau');
            }
        }
        
        throw new Error('Không thể tạo bài review. Vui lòng thử lại sau.');
    }
}
