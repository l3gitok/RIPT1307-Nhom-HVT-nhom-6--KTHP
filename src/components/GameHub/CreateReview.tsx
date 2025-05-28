import { useState } from 'react';
import { ReviewService } from '@/services';

export default function CreateReview() {
	const [content, setContent] = useState('');
	const [rating, setRating] = useState(5);
	const [gameId, setGameId] = useState('');
	const [message, setMessage] = useState('');
	const token = localStorage.getItem('token');

	const handleSubmit = async () => {
		try {
			await ReviewService.createReview({ game_id: gameId, content, rating }, token!);
			setMessage('Tạo bài viết thành công!');
		} catch (e) {
			setMessage('Có lỗi khi tạo bài viết');
		}
	};

	return (
		<div>
			<input value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder='Game ID' />
			<textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder='Nội dung' />
			<input type='number' value={rating} onChange={(e) => setRating(Number(e.target.value))} min={1} max={5} />
			<button onClick={handleSubmit}>Tạo bài viết</button>
			<div>{message}</div>
		</div>
	);
}
