import axios from '@/utils/axios';
import type { AxiosResponse } from 'axios';

const API_URL = 'https://gamehubapi-test.onrender.com/api';

interface UploadResponse {
	success: boolean;
	data: {
		url: string;
		public_id: string;
	};
}

export const UploadService = {
	async uploadImage(file: File, token: string): Promise<AxiosResponse<UploadResponse>> {
		if (!file) {
			throw new Error('File is required');
		}

		if (!token) {
			throw new Error('Authorization token is required');
		}

		try {
			const formData = new FormData();
			formData.append('image', file);

			const headers = {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'multipart/form-data',
			};

			const response = await axios.post<UploadResponse>(`${API_URL}/upload/image`, formData, {
				headers,
				maxContentLength: Infinity,
				maxBodyLength: Infinity,
			});

			if (!response.data?.data?.url) {
				throw new Error('Upload failed: No URL returned');
			}

			return response;
		} catch (error: any) {
			console.error('Upload error:', error.response?.data || error.message);

			if (error.response?.status === 401) {
				throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
			}

			throw error;
		}
	},
};
