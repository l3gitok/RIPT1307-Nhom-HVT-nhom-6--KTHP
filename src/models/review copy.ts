export interface Review {
	_id: string;
	game_id: string;
	content: string;
	rating: number;
	images: string[];
	author_id?: string;
	status?: string;
	created_at?: string;
	updated_at?: string;
}

// Hàm kiểm tra dữ liệu hợp lệ cho review
export function validateReview(data: Partial<Review>): string | null {
	if (!data.content || data.content.length < 10 || data.content.length > 2000) {
		return 'Nội dung review phải từ 10-2000 ký tự';
	}
	if (!data.rating || data.rating < 1 || data.rating > 5) {
		return 'Điểm đánh giá phải từ 1-5';
	}
	if (!data.game_id) {
		return 'Thiếu game_id';
	}
	return null;
}
