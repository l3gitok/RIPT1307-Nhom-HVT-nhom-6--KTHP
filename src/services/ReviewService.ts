import axios from '@/utils/axios';
import { Review } from '@/models/review';

const API_URL = 'https://gamehubapi-test.onrender.com/api/';

export const ReviewService = {
	// Lấy danh sách review (bài viết)
	async getReviews(params?: { gameId?: string; userId?: string; page?: number; limit?: number }) {
		return axios.get(`${API_URL}/reviews`, { params });
	},

	// Lấy review theo game
	async getReviewsByGame(gameId: string) {
		return axios.get(`${API_URL}/reviews/game/${gameId}`);
	},

	// Lấy review theo user
	async getReviewsByUser(userId: string) {
		return axios.get(`${API_URL}/reviews/user/${userId}`);
	},

	// Lấy chi tiết review
	async getReviewById(id: string) {
		return axios.get(`${API_URL}/reviews/${id}`);
	},

	// Tạo review mới
	async createReview(data: { game_id: string; content: string; rating: number; images?: string[] }, token: string) {
		return axios.post(`${API_URL}/reviews`, data, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};
