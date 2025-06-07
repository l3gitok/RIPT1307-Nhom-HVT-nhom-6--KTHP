import axios from '@/utils/axios';
import type { Review } from '@/services/ReviewServices';

const API_URL = 'https://gamehubapi-test.onrender.com/api';

export const ReviewService = {
	// Lấy danh sách review (bài viết)
	async getReviews(params?: {
		game_id?: string;
		user_id?: string;
		page?: number;
		limit?: number;
		status?: 'pending' | 'approved' | 'rejected';
	}) {
		try {
			const response = await axios.get(`${API_URL}/reviews`, { params });
			return response.data;
		} catch (error) {
			console.error('Error fetching reviews:', error);
			throw error;
		}
	},

	// Lấy review theo game
	async getReviewsByGame(gameId: string) {
		try {
			const response = await axios.get(`${API_URL}/reviews`, {
				params: { game_id: gameId },
			});
			return response.data;
		} catch (error) {
			console.error('Error fetching game reviews:', error);
			throw error;
		}
	},

	// Lấy review theo user
	async getReviewsByUser(userId: string) {
		try {
			const response = await axios.get(`${API_URL}/reviews`, {
				params: { user_id: userId },
			});
			return response.data;
		} catch (error) {
			console.error('Error fetching user reviews:', error);
			throw error;
		}
	},

	// Lấy chi tiết review
	async getReviewById(id: string) {
		try {
			const response = await axios.get(`${API_URL}/reviews/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error fetching review details:', error);
			throw error;
		}
	},
	// Tạo review mới
	async createReview(
		data: {
			game_id: string;
			content: string;
			rating: number;
			images?: string[];
		},
		token: string,
	) {
		if (!data.game_id || !data.content || !data.rating) {
			throw new Error('Missing required fields');
		}

		try {
			// Đảm bảo review mới luôn có trạng thái pending
			const reviewData = {
				...data,
				status: 'pending',
			};

			const response = await axios.post(`${API_URL}/reviews`, reviewData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			return response.data;
		} catch (error: any) {
			console.error('Error creating review:', error);
			if (error.response?.data?.message) {
				throw new Error(error.response.data.message);
			}
			throw new Error('Could not create review. Please try again later.');
		}
	},
};
