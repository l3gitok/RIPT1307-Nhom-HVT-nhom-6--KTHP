import { Button, Col, Image, Row, Typography, Input, Dropdown, Menu, Modal, List } from 'antd';
import React, { useState } from 'react';
import { SearchOutlined, UserOutlined, DislikeOutlined } from '@ant-design/icons';
import GameHubHeader from '@/components/GameHub/Header';

const { Text } = Typography;

const userMenu = (
	<Menu>
		<Menu.Item key='1'>Đăng ký</Menu.Item>
		<Menu.Item key='2'>Đăng nhập</Menu.Item>
	</Menu>
);

const NAV_ITEMS: { label: string; key: number }[] = [];

const COMMENTS = ['Địt mẹ thằng Vũ', 'Bình luận mẫu 2', 'Bình luận mẫu 3'];

const UserPage = (): JSX.Element => {
	const [searchText, setSearchText] = useState('');
	const [activeNav, setActiveNav] = useState(0);
	const [commentModalOpen, setCommentModalOpen] = useState(false);
	const [myComment, setMyComment] = useState('');

	return (
		<div style={{ background: '#fff', minHeight: '100vh' }}>
			<GameHubHeader
				searchText={searchText}
				setSearchText={setSearchText}
				activeNav={activeNav}
				setActiveNav={setActiveNav}
				userMenu={userMenu}
				NAV_ITEMS={NAV_ITEMS}
			/>
			<div style={{ paddingTop: 90, maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24 }}>
				{/* Main left */}
				<div style={{ flex: 2, minWidth: 0 }}>
					{/* Banner */}
					<div style={{ height: 180, background: '#ddd', borderRadius: 12, marginBottom: -70 }} />
					{/* Profile card */}
					<div
						style={{
							background: '#fff',
							borderRadius: 16,
							boxShadow: '0 2px 8px #eee',
							padding: 24,
							marginBottom: 24,
							position: 'relative',
						}}
					>
						<div style={{ position: 'absolute', top: -70, left: 32 }}>
							<div
								style={{ width: 140, height: 140, background: '#c44', borderRadius: '50%', border: '6px solid #fff' }}
							/>
						</div>
						<div style={{ marginLeft: 180 }}>
							<Row align='middle' gutter={16}>
								<Col>
									<Text strong style={{ fontSize: 28 }}>
										Wren Evú
									</Text>
								</Col>
								<Col>
									<Button style={{ fontWeight: 500 }}>Chỉnh sửa trang cá nhân</Button>
								</Col>
							</Row>
							<Row align='middle' gutter={24} style={{ marginTop: 8 }}>
								<Col>
									<Text strong>111</Text> Người theo dõi
								</Col>
								<Col>
									<Text strong>111</Text> Đang theo dõi
								</Col>
							</Row>
							<Row align='middle' gutter={12} style={{ marginTop: 12 }}>
								<Col>
									<Button size='small' style={{ background: '#eee', borderRadius: 16 }}>
										Ngôi sao đang lên
									</Button>
								</Col>
								<Col>
									<Button size='small' style={{ background: '#eee', borderRadius: 16 }}>
										Đấu trường chân lý
									</Button>
								</Col>
							</Row>
						</div>
					</div>
					{/* Bài đăng */}
					<div style={{ background: '#f7f7f7', borderRadius: 16, padding: 24, marginBottom: 24 }}>
						<Text strong>Bài đăng :</Text>
						<div style={{ marginTop: 16, background: '#fff', borderRadius: 12, padding: 16 }}>
							<Row align='middle' gutter={12}>
								<Col>
									<div style={{ width: 48, height: 48, background: '#ccc', borderRadius: '50%' }} />
								</Col>
								<Col flex='auto'>
									<Text strong>Lim Feng</Text>
									<br />
									<Text type='secondary' style={{ fontSize: 13 }}>
										Người mới
									</Text>
								</Col>
								<Col>
									<Button size='small' style={{ background: '#ef5f34', color: '#fff', borderRadius: 16 }}>
										Follow
									</Button>
								</Col>
								<Col>
									<Button size='small' style={{ background: '#ed8e8e', borderRadius: 16, color: '#fff' }}>
										Liên minh huyền thoại
									</Button>
								</Col>
							</Row>
							<div style={{ margin: '12px 0 16px 0', fontSize: 15 }}>Địt mẹ thằng Vũ</div>
							<div style={{ width: '100%', height: 220, background: '#e0e0e0', borderRadius: 12, marginBottom: 12 }} />
							<Row gutter={16} align='middle'>
								<Col>
									<Button
										size='middle'
										icon={
											<Image
												preview={false}
												width={20}
												height={20}
												src='https://c.animaapp.com/mb36s6z6gMvutO/img/mdi-like.svg'
												alt='Like Icon'
											/>
										}
									>
										10
									</Button>
								</Col>
								<Col>
									<Button size='middle' icon={<DislikeOutlined style={{ fontSize: 20 }} />}>
										2
									</Button>
								</Col>
								<Col>
									<Button
										size='middle'
										icon={
											<Image
												preview={false}
												width={20}
												height={20}
												src='https://c.animaapp.com/mb36s6z6gMvutO/img/icon-park-outline-comment.svg'
												alt='Comment Icon'
											/>
										}
										onClick={() => setCommentModalOpen(true)}
									>
										11
									</Button>
								</Col>
								<Col>
									<Button
										size='middle'
										icon={
											<Image
												preview={false}
												width={20}
												height={20}
												src='https://c.animaapp.com/mb36s6z6gMvutO/img/material-symbols-share.svg'
												alt='Share Icon'
											/>
										}
									/>
								</Col>
								<Col flex='auto' />
								<Col>
									<Button
										size='middle'
										icon={
											<Image
												preview={false}
												width={20}
												height={20}
												src='https://c.animaapp.com/mb36s6z6gMvutO/img/material-symbols-star.svg'
												alt='Star Icon'
											/>
										}
									>
										4.5/5
									</Button>
								</Col>
							</Row>
						</div>
					</div>
				</div>
				{/* Main right */}
				<div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 24 }}>
					<div style={{ background: '#f2f2f2', borderRadius: 12, padding: 24, minHeight: 120 }}>
						<Text strong>Thông tin cá nhân</Text>
					</div>
					<div style={{ background: '#f2f2f2', borderRadius: 12, padding: 24, minHeight: 220 }}>
						<Text strong>Quảng cáo</Text>
					</div>
				</div>
			</div>
			{/* Modal bình luận */}
			<Modal
				visible={commentModalOpen}
				onCancel={() => setCommentModalOpen(false)}
				footer={null}
				width={420}
				bodyStyle={{
					background: 'transparent',
					borderRadius: 50,
					padding: 20,
					boxShadow: 'none',
					position: 'relative',
				}}
				style={{ top: 100, background: 'transparent', boxShadow: 'none', padding: 0, borderRadius: 50 }}
				closable={false}
			>
				{/* Nút đóng */}
				<Button
					onClick={() => setCommentModalOpen(false)}
					style={{
						position: 'absolute',
						top: 8,
						right: 12,
						zIndex: 2,
						background: 'transparent',
						border: 'none',
						fontSize: 22,
					}}
				>
					×
				</Button>
				{/* Nội dung modal */}
				<div>
					{/* Khung nhập bình luận */}
					<Row align='middle' gutter={12} style={{ marginBottom: 12, marginTop: 24 }}>
						<Col>
							<div style={{ width: 48, height: 48, background: '#f66', borderRadius: '50%' }} />
						</Col>
						<Col flex='auto'>
							<Input
								style={{ background: '#f6bcbc', border: 'none', borderRadius: 12, height: 32 }}
								placeholder='Hãy nhận xét game của bạn'
								value={myComment}
								onChange={(e) => setMyComment(e.target.value)}
							/>
						</Col>
						{myComment && (
							<Col>
								<Button
									style={{ background: '#f6bcbc', border: 'none', borderRadius: 12 }}
									onClick={() => {
										setMyComment('');
									}}
								>
									Gửi
								</Button>
							</Col>
						)}
					</Row>
					<hr style={{ border: '1px solid #888', margin: '12px 0' }} />
					{/* Danh sách bình luận */}
					<List
						dataSource={COMMENTS}
						renderItem={(item) => (
							<List.Item style={{ background: 'none', border: 'none', padding: 0, marginBottom: 12 }}>
								<Row align='middle' gutter={12} style={{ width: '100%' }}>
									<Col>
										<div style={{ width: 48, height: 48, background: '#f66', borderRadius: '50%' }} />
									</Col>
									<Col flex='auto'>
										<div style={{ background: '#f6bcbc', borderRadius: 20, padding: '8px 16px', fontSize: 15 }}>
											{item}
										</div>
									</Col>
								</Row>
							</List.Item>
						)}
					/>
				</div>
			</Modal>
		</div>
	);
};

export default UserPage;
