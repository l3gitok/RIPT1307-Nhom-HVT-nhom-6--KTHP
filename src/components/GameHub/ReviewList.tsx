import { useEffect, useState } from 'react';
import { ReviewService } from '@/services';
import { Review } from '@/models';

export default function ReviewList() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		ReviewService.getReviews()
			.then((res) => setReviews(res.data))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div>Đang tải...</div>;
	return (
		<div>
			{reviews.map((r) => (
				<div key={r._id} style={{ border: '1px solid #eee', margin: 8, padding: 8 }}>
					<h3>{r.content}</h3>
					<div>Rating: {r.rating}</div>
				</div>
			))}
		</div>
	);
}
