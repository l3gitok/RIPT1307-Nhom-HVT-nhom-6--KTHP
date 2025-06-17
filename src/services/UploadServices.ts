import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

// ===== INTERFACES =====
export interface UploadResponse {
	success: boolean;
	data: {
		url: string;
		public_id: string;
	};
	message?: string;
}

export interface MultipleUploadResponse {
	success: boolean;
	data: {
		url: string;
		public_id: string;
	}[];
	message?: string;
}

export interface UploadProgress {
	loading: boolean;
	progress: number;
}

// ===== VALIDATION FUNCTIONS =====
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
	const isImage = file.type.startsWith('image/');
	if (!isImage) {
		return { isValid: false, error: 'Chỉ được upload file ảnh (JPG, PNG, JPEG)' };
	}

	const isValidSize = file.size / 1024 / 1024 < 5;
	if (!isValidSize) {
		return { isValid: false, error: 'Ảnh phải nhỏ hơn 5MB' };
	}

	return { isValid: true };
};

// ===== ERROR HANDLING =====
export const handleUploadError = (error: any) => {
	console.error('Upload error:', error);

	if (error.response?.status === 401) {
		message.error('Phiên đăng nhập hết hạn - vui lòng đăng nhập lại');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		// Redirect to login - will be handled by calling component
	} else if (error.response?.status === 400) {
		const errorMessage = error.response?.data?.message;
		message.error(errorMessage || 'File không hợp lệ');
	} else if (error.response?.status === 413) {
		message.error('File quá lớn - vui lòng chọn file nhỏ hơn 5MB');
	} else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
		message.error('Upload timeout - vui lòng thử lại');
	} else if (error.message.includes('Network Error')) {
		message.error('Lỗi mạng - vui lòng kiểm tra kết nối internet');
	} else {
		message.error(error.response?.data?.message || 'Upload thất bại - vui lòng thử lại');
	}
};

// ===== UPLOAD FUNCTIONS =====
export const uploadSingleImage = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
	const validation = validateImageFile(file);
	if (!validation.isValid) {
		throw new Error(validation.error);
	}

	const formData = new FormData();
	formData.append('image', file);

	const token = localStorage.getItem('accessToken');
	if (!token) {
		throw new Error('Phiên đăng nhập hết hạn - vui lòng đăng nhập lại');
	}

	try {
		const response = await axios.post<UploadResponse>(`${API_BASE_URL}/upload/image`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${token}`,
			},
			timeout: 30000,
			onUploadProgress: (progressEvent) => {
				if (progressEvent.total && onProgress) {
					const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					onProgress(Math.min(progress, 90));
				}
			},
		});

		if (response.data?.success && response.data.data?.url) {
			onProgress?.(100);
			return response.data.data.url;
		} else {
			throw new Error('Upload failed - no URL returned');
		}
	} catch (error: any) {
		handleUploadError(error);
		throw error;
	}
};

export const uploadMultipleImages = async (
	files: File[],
	onProgress?: (progress: number) => void,
): Promise<string[]> => {
	if (files.length === 0) return [];

	// Validate all files
	for (const file of files) {
		const validation = validateImageFile(file);
		if (!validation.isValid) {
			throw new Error(`File "${file.name}": ${validation.error}`);
		}
	}

	const formData = new FormData();
	files.forEach((file) => {
		formData.append('images', file);
	});

	const token = localStorage.getItem('accessToken');
	if (!token) {
		throw new Error('Phiên đăng nhập hết hạn - vui lòng đăng nhập lại');
	}

	try {
		const response = await axios.post<MultipleUploadResponse>(`${API_BASE_URL}/upload/images`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${token}`,
			},
			timeout: 60000,
			onUploadProgress: (progressEvent) => {
				if (progressEvent.total && onProgress) {
					const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					onProgress(Math.min(progress, 95));
				}
			},
		});

		if (response.data?.success && Array.isArray(response.data.data)) {
			onProgress?.(100);
			return response.data.data.map((item) => item.url);
		} else {
			throw new Error('Upload failed - no URLs returned');
		}
	} catch (error: any) {
		handleUploadError(error);
		throw error;
	}
};
