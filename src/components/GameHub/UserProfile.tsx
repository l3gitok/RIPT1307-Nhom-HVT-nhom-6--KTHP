import { useEffect, useState } from 'react';
import { UserService } from '@/services';
import type { User } from '@/models/user copy';

export default function UserProfile() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const token = localStorage.getItem('token');

	useEffect(() => {
		if (token) {
			setLoading(true);
			setError(null);
			UserService.getMe(token)
				.then((res) => setUser(res.data))
				.catch(() => setError('Không thể tải thông tin người dùng'))
				.finally(() => setLoading(false));
		}
	}, [token]);

	if (!token) return <div>Chưa đăng nhập</div>;
	if (loading) return <div>Đang tải...</div>;
	if (error) return <div style={{ color: 'red' }}>{error}</div>;
	if (!user) return null;

	return (
		<div style={{ padding: 16, border: '1px solid #eee', borderRadius: 4 }}>
			<h2>{user.profile.username}</h2>
			<div style={{ marginTop: 8 }}>Email: {user.email}</div>
			{user.profile.avatar_url && (
				<img
					src={user.profile.avatar_url}
					alt='avatar'
					style={{
						marginTop: 12,
						maxWidth: 100,
						borderRadius: '50%',
					}}
				/>
			)}
		</div>
	);
}
