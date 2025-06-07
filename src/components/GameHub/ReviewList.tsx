import { ReviewService } from '@/services';
import type { Review } from '@/services/ReviewServices';
import { useEffect, useState } from 'react';

export default function ReviewList() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		ReviewService.getReviews()
			.then((res) => setReviews(res.data))
			.catch(() => setError('Không thể tải danh sách đánh giá'))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div>Đang tải...</div>;
	if (error) return <div style={{ color: 'red' }}>{error}</div>;
	if (reviews.length === 0) return <div>Chưa có đánh giá nào.</div>;

	return (
		<div>
			{reviews.map((r) => (
				<div
					key={r._id}
					style={{
						border: '1px solid #eee',
						margin: 8,
						padding: 12,
						borderRadius: 4,
					}}
				>
					<div style={{ marginBottom: 8 }}>
						<span style={{ fontWeight: 'bold' }}>{r.author_id?.profile?.username || 'Ẩn danh'}</span>
						<span style={{ color: '#666', marginLeft: 8 }}>đánh giá {r.rating}/5</span>
					</div>
					<div>{r.content}</div>
				</div>
			))}
		</div>
	);
}
