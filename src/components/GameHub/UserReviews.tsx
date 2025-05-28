import { useEffect, useState } from 'react';
import { ReviewService } from '@/services';
import { Review } from '@/models';

export default function UserReviews({ userId }: { userId: string }) {
	const [reviews, setReviews] = useState<Review[]>([]);

	useEffect(() => {
		ReviewService.getReviewsByUser(userId).then((res) => setReviews(res.data));
	}, [userId]);

	return (
		<div>
			{reviews.map((r) => (
				<div key={r._id}>{r.content}</div>
			))}
		</div>
	);
}
