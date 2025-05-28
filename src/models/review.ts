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
	return response.data.data;
}
