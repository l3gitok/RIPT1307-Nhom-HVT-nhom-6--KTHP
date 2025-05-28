import axios from '@/utils/axios';
import { Game } from '@/models/game';

const API_URL = 'https://gamehubapi-test.onrender.com/api/';

export const GameService = {
	// Lấy danh sách game
	async getGames(params?: { page?: number; limit?: number; sort?: string; search?: string }) {
		return axios.get(`${API_URL}/games`, { params });
	},

	// Lấy chi tiết game
	async getGameById(id: string) {
		return axios.get(`${API_URL}/games/${id}`);
	},

	// Tạo game mới (admin)
	async createGame(data: { title: string; description: string; cover_url: string }, token: string) {
		return axios.post(`${API_URL}/games`, data, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};
