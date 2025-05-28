export interface Review {
	// Các trường cơ bản
	_id: string;
	content: string; // 10-2000 ký tự
	rating: number; // 1-5
	images: string[]; // URLs hình ảnh
	game_id: {
		_id: string;
		title: string;
		[key: string]: any;
	};
	author_id: {
		_id: string;
		profile: {
			username: string;
		};
		[key: string]: any;
	};
	status: 'pending' | 'approved' | 'rejected';

	// Các trường tương tác
	likes: {
		user_id: string; // ObjectId của User
		created_at: Date;
	}[];

	replies: {
		user_id: string; // ObjectId của User
		content: string; // max 500 ký tự
		created_at: Date;
	}[];

	// Các trường thống kê
	helpful_count: number;
	is_featured: boolean;

	// Timestamps
	created_at: Date;
	updated_at: Date;

	// Virtual fields
	likes_count: number;
	replies_count: number;

	// Additional fields
	[key: string]: any;
}

// ...existing code...

// Interface cho việc tạo review mới
interface CreateReviewDTO {
	content: string;
	rating: number;
	images?: string[];
	game_id: string;
	author_id: string;
}

// Interface cho việc cập nhật review
interface UpdateReviewDTO {
	content?: string;
	rating?: number;
	images?: string[];
	status?: 'pending' | 'approved' | 'rejected';
	is_featured?: boolean;
}

// Interface cho việc thêm reply
interface AddReplyDTO {
	user_id: string;
	content: string;
}

// Interface cho việc like review
interface LikeReviewDTO {
	user_id: string;
}
