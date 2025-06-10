import { Typography, Layout } from 'antd';
import { useState } from 'react';
import GameHubHeader from '@/components/GameHub/Header';
import Navbar from '@/components/GameHub/Navbar';
import FollowingPosts from '@/components/GameHub/FollowingPosts';

const { Text } = Typography;
const { Content } = Layout;

const NAV_ITEMS = [
	{ label: 'Đang theo dõi', key: 0 },
	{ label: 'Trang chủ', key: 1 },
	{ label: 'Bảng Xếp Hạng', key: 2 },
];

const DangTheoDoi = (): JSX.Element => {
	const [searchText, setSearchText] = useState('');
	const [activeNav, setActiveNav] = useState(0); // Set active nav to "Đang theo dõi"

	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#FFFCFE' }}>
			<GameHubHeader
				searchText={searchText}
				setSearchText={setSearchText}
				activeNav={activeNav}
				setActiveNav={setActiveNav}
				NAV_ITEMS={NAV_ITEMS}
			/>
			<Navbar
				navItems={NAV_ITEMS}
				activeNav={activeNav}
				setActiveNav={setActiveNav}
				navLinks={{ 0: '/dang-theo-doi', 1: '/dashboard', 2: '/bang-xep-hang' }}
			/>{' '}
			<Content style={{ padding: '24px', backgroundColor: '#FFFCFE', paddingTop: '70px' }}>
				<div style={{ maxWidth: '800px', margin: '0 auto' }}>
					<div style={{ marginBottom: '24px' }}>
						<Text style={{ fontSize: '24px', fontWeight: 'bold' }}>Bài viết từ những người bạn theo dõi</Text>
					</div>

					{/* Component hiển thị bài viết từ những người đang theo dõi */}
					<FollowingPosts />
				</div>
			</Content>
		</Layout>
	);
};

export default DangTheoDoi;
