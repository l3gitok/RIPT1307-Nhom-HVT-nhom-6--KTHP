import axios from '@/utils/axios';
import type { AxiosResponse } from 'axios';

const API_URL = 'https://gamehubapi-test.onrender.com/api';

interface UploadResponse {
	url: string;
	message: string;
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
				Accept: 'application/json',
			};
			const response = await axios.post<UploadResponse>(`${API_URL}/upload`, formData, {
				headers,
				maxContentLength: Infinity,
				maxBodyLength: Infinity,
			});

			if (!response.data?.url) {
				throw new Error('Upload failed: No URL returned');
			}

			return response;
		} catch (error: any) {
			console.error('Upload error:', error.response?.data || error.message);

			if (error.response?.status === 401) {
				throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
			}

			if (error.response?.status === 404) {
				throw new Error('Endpoint không tồn tại. Vui lòng kiểm tra lại URL.');
			}

			throw new Error(error.response?.data?.message || 'Không thể tải lên ảnh. Vui lòng thử lại.');
		}
	},
};
