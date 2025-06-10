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
}): Promise<{ reviews: Review[]; pagination: any }> {
    const response = await axios.get(API_URL, { params });

    // Dữ liệu đúng từ API: response.data.reviews
    const reviews = Array.isArray(response.data?.reviews) ? response.data.reviews : [];

    // Tính toán và lưu thống kê vào localStorage
    calculateAndSaveReviewStats(reviews);

    const pagination = {
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 1,
        currentPage: response.data?.currentPage || 1,
    };

    return { reviews, pagination };
}

export async function updateReviewStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Review> {
    const response = await axios.patch(
        `${API_URL}/${id}/status`,
        { status }, // body chính xác
        { headers: getAuthHeader() },
    );
    
    // Cập nhật lại thống kê sau khi thay đổi status
    await refreshReviewStats();
    
    return response.data.data;
}

// Hàm tính toán và lưu thống kê review
function calculateAndSaveReviewStats(reviews: Review[]) {
    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(review => review.status === 'pending').length;
    const approvedReviews = reviews.filter(review => review.status === 'approved').length;
    const rejectedReviews = reviews.filter(review => review.status === 'rejected').length;

    // Lưu vào localStorage
    localStorage.setItem('totalReviews', totalReviews.toString());
    localStorage.setItem('pendingReviews', pendingReviews.toString());
    localStorage.setItem('approvedReviews', approvedReviews.toString());
    localStorage.setItem('rejectedReviews', rejectedReviews.toString());
}

// Hàm lấy thống kê từ localStorage
export function getReviewStatsFromStorage() {
    return {
        totalReviews: parseInt(localStorage.getItem('totalReviews') || '0', 10),
        pendingReviews: parseInt(localStorage.getItem('pendingReviews') || '0', 10),
        approvedReviews: parseInt(localStorage.getItem('approvedReviews') || '0', 10),
        rejectedReviews: parseInt(localStorage.getItem('rejectedReviews') || '0', 10),
    };
}

// Hàm làm mới thống kê bằng cách fetch lại tất cả reviews
async function refreshReviewStats() {
    try {
        const { reviews } = await fetchReviews();
        calculateAndSaveReviewStats(reviews);
    } catch (error) {
        console.error('Error refreshing review stats:', error);
    }
}