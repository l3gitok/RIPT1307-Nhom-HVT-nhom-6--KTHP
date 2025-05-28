import { useEffect, useState } from 'react';
import { UserService } from '@/services';
import { User } from '@/models';

export default function UserProfile() {
	const [user, setUser] = useState<User | null>(null);
	const token = localStorage.getItem('token');

	useEffect(() => {
		if (token) {
			UserService.getMe(token).then((res) => setUser(res.data));
		}
	}, [token]);

	if (!user) return <div>Chưa đăng nhập</div>;
	return (
		<div>
			<h2>{user.profile.username}</h2>
			<div>Email: {user.email}</div>
			{user.profile.avatar_url && <img src={user.profile.avatar_url} alt='avatar' />}
		</div>
	);
}
