import axios from '@/utils/axios';
import { User } from '@/models/user';

const API_URL = 'https://gamehubapi-test.onrender.com/api/';

export const UserService = {
	// Lấy thông tin user từ token
	async getMe(token: string) {
		return axios.get(`${API_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
	// Lấy user theo id
	async getUserById(id: string, token: string) {
		return axios.get(`${API_URL}/auth/user/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};
