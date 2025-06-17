import React, { useState } from 'react';
import { Typography, Layout, Button, Space } from 'antd';
import { PlusOutlined, HeartOutlined } from '@ant-design/icons';
import { history } from 'umi';
import GameHubHeader from '@/components/GameHub/Header';
import Navbar from '@/components/GameHub/Navbar';
import FollowingPosts from './components/FollowingPosts';

const { Text, Title } = Typography;
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
				navLinks={{ 0: '/dang-theo-doi', 1: '/home', 2: '/bang-xep-hang' }}
			/>
			<Content style={{ padding: '24px', backgroundColor: '#FFFCFE', paddingTop: '70px' }}>
				<div style={{ maxWidth: '800px', margin: '0 auto' }}>
					{/* ✅ Enhanced Header */}
					<div style={{ marginBottom: '24px', textAlign: 'center' }}>
						<Title level={2} style={{ color: '#120C0C', marginBottom: '8px' }}>
							<HeartOutlined style={{ marginRight: '12px', color: '#ff4d4f' }} />
							Đang theo dõi
						</Title>
						<Text type='secondary' style={{ fontSize: '16px' }}>
							Những bài viết mới nhất từ người bạn theo dõi
						</Text>

						{/* ✅ Action buttons */}
						<div style={{ marginTop: '16px' }}>
							<Space>
								<Button type='primary' icon={<PlusOutlined />} onClick={() => history.push('/home')}>
									Tạo bài viết mới
								</Button>
								<Button onClick={() => history.push('/discover')}>Khám phá người dùng</Button>
							</Space>
						</div>
					</div>

					{/* ✅ Following Posts Component */}
					<FollowingPosts />
				</div>
			</Content>
		</Layout>
	);
};

export default DangTheoDoi;
