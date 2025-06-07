import { useEffect, useState } from 'react';
import { ReviewService } from '@/services';
import type { Review } from '@/services/ReviewServices';

export default function UserReviews({ userId }: { userId: string }) {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		ReviewService.getReviewsByUser(userId)
			.then((res) => setReviews(res.data))
			.catch(() => setError('Không thể tải đánh giá của người dùng'))
			.finally(() => setLoading(false));
	}, [userId]);

	if (loading) return <div>Đang tải...</div>;
	if (error) return <div style={{ color: 'red' }}>{error}</div>;
	if (reviews.length === 0) return <div>Người dùng chưa có đánh giá nào.</div>;

	return (
		<div>
			{reviews.map((r) => (
				<div key={r._id} style={{ border: '1px solid #eee', margin: 8, padding: 12, borderRadius: 4 }}>
					<div style={{ marginBottom: 8 }}>
						<span style={{ fontWeight: 'bold' }}>{r.game_id?.title || 'Game không xác định'}</span>
						<span style={{ color: '#666', marginLeft: 8 }}>{r.rating}/5</span>
					</div>
					<div>{r.content}</div>
					{r.images && r.images.length > 0 && (
						<div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
							{r.images.map((url, index) => (
								<img
									key={index}
									src={url}
									alt={`review-${index + 1}`}
									style={{
										width: 60,
										height: 60,
										objectFit: 'cover',
										borderRadius: 4,
									}}
								/>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
