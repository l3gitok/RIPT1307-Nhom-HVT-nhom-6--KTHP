import axios from '@/utils/axios';
const API_URL = 'https://gamehubapi-test.onrender.com/api';

export const ReviewService = {
	// Lấy danh sách review (bài viết)
	async getReviews(params?: { gameId?: string; userId?: string; page?: number; limit?: number; status?: string }) {
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

	// Cập nhật trạng thái review (approve/reject)
	async updateReviewStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
		return axios.patch(`${API_URL}/reviews/${id}/status`, { status });
	},

	// Like một review
	async likeReview(id: string) {
		return axios.post(`${API_URL}/reviews/${id}/like`);
	},

	// Bỏ like một review
	async unlikeReview(id: string) {
		return axios.delete(`${API_URL}/reviews/${id}/like`);
	},

	// Comment vào review
	async commentReview(id: string, content: string) {
		return axios.post(`${API_URL}/reviews/${id}/comments`, { content });
	},
};
