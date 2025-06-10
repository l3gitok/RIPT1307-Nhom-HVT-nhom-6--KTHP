import { Button, Col, Image, Row, Typography, Layout, Input, Dropdown, Menu, Modal, List, Upload, message } from 'antd';
import React, { useState } from 'react';
import { SearchOutlined, UserOutlined, DislikeOutlined, UploadOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import GameHubHeader from '@/components/GameHub/Header';
import Navbar from '@/components/GameHub/Navbar';
import ProfileSection from '@/components/GameHub/ProfileSection';
import PostModal from '@/components/GameHub/PostModal';
import PostContent from '@/components/GameHub/PostContent';
import CommentModal from '@/components/GameHub/CommentModal';
import HomeReviews from '@/components/GameHub/HomeReviews';
import { history } from 'umi';

const { Text } = Typography;
const { Header, Content } = Layout;

const userMenu = (
	<Menu>
		<Menu.Item key='register' onClick={() => history.push('/user/register')}>
			Đăng ký
		</Menu.Item>
		<Menu.Item key='login' onClick={() => history.push('/user/login')}>
			Đăng nhập
		</Menu.Item>
	</Menu>
);

const NAV_ITEMS = [
	{ label: 'Đang theo dõi', key: 0 },
	{ label: 'Trang chủ', key: 1 },
	{ label: 'Bảng Xếp Hạng', key: 2 },
];
const Desktop = (): JSX.Element => {
	const [searchText, setSearchText] = useState('');
	const [activeNav, setActiveNav] = useState(1);
	const [commentModalOpen, setCommentModalOpen] = useState(false);
	const [myComment, setMyComment] = useState('');
	const [postModalOpen, setPostModalOpen] = useState(false);
	const [postImages, setPostImages] = useState<string[]>([]);
	const [postContent, setPostContent] = useState('');

	const handleUpload = (info: any) => {
		const files = (info.fileList || []).map((f: any) => f.originFileObj || f.file).filter(Boolean);
		if (files.length === 0) {
			setPostImages([]);
			return;
		}
		const readers = files.map((file: File) => {
			return new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = (e) => resolve(e.target?.result as string);
				reader.readAsDataURL(file);
			});
		});
		Promise.all(readers).then((imgs) => setPostImages(imgs));
	};

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
			/>
			<Content style={{ padding: '24px', backgroundColor: '#FFFCFE', paddingTop: '70px' }}>
				{/* Nút đăng bài */}
				<Row align='middle' style={{ maxWidth: 700, margin: '0 auto 24px auto' }} gutter={16}>
					<Col>
						<div style={{ width: 40, height: 40, background: '#b44', borderRadius: '50%' }} />
					</Col>
					<Col flex='auto'>
						<Button
							style={{
								width: '100%',
								height: 40,
								background: '#d6d6d6',
								borderRadius: 16,
								textAlign: 'left',
								fontWeight: 500,
							}}
							onClick={() => setPostModalOpen(true)}
						>
							Hãy nhận xét game của bạn
						</Button>
					</Col>
				</Row>
				{/* Modal đăng bài */}
				<PostModal
					visible={postModalOpen}
					onCancel={() => setPostModalOpen(false)}
					postContent={postContent}
					setPostContent={setPostContent}
					postImages={postImages}
					setPostImages={setPostImages}
					handleUpload={handleUpload}
				/>
				{/* Main content */}
				<div style={{ maxWidth: '600px', margin: '0 auto' }}>
					<HomeReviews />
				</div>
			</Content>
		</Layout>
	);
};

export default Desktop;
