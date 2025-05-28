import axios from '@/utils/axios';

const API_URL = 'https://gamehubapi-test.onrender.com/api/';

export const UploadService = {
	// Upload 1 ảnh
	async uploadImage(file: File, token: string) {
		const formData = new FormData();
		formData.append('image', file);
		return axios.post(`${API_URL}/upload`, formData, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'multipart/form-data',
			},
		});
	},
};
