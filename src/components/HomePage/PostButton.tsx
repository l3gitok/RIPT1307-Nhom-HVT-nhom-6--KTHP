import React from 'react';
import { Card, Row, Col, Avatar, Button, Space } from 'antd';
import { UserOutlined, PlusOutlined, CameraOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import type { User } from '../../services/UserServices';

interface PostButtonProps {
	currentUser: User | null;
	onOpenModal: () => void;
}

const PostButton: React.FC<PostButtonProps> = ({ currentUser, onOpenModal }) => {
	const history = useHistory();

	const handleButtonClick = () => {
		if (!currentUser) {
			history.push('/user/login');
			return;
		}
		onOpenModal();
	};

	return (
		<div style={{ maxWidth: 700, margin: '0 auto 32px auto', padding: '0 16px' }}>
			<Card
				style={{
					borderRadius: 16,
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
					border: '1px solid #f0f0f0',
				}}
				bodyStyle={{ padding: '16px' }}
			>
				<Row align='middle' gutter={16}>
					<Col>
						<Avatar src={currentUser?.profile?.avatar_url} icon={<UserOutlined />} size={40} />
					</Col>
					<Col flex='auto'>
						<Button
							style={{
								width: '100%',
								height: 44,
								background: '#f6f6f6',
								border: '1px solid #e8e8e8',
								borderRadius: 22,
								textAlign: 'left',
								fontWeight: 500,
								color: '#666',
								fontSize: '14px',
								transition: 'all 0.3s ease',
							}}
							onClick={handleButtonClick}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = '#f0f0f0';
								e.currentTarget.style.borderColor = '#d9d9d9';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = '#f6f6f6';
								e.currentTarget.style.borderColor = '#e8e8e8';
							}}
						>
							<Space>
								<PlusOutlined style={{ fontSize: '12px' }} />
								{currentUser ? 'Viết review game...' : 'Đăng nhập để viết review'}
							</Space>
						</Button>
					</Col>
					<Col>
						<Space>
							<Button
								type='text'
								icon={<CameraOutlined />}
								style={{
									borderRadius: '50%',
									width: 40,
									height: 40,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
								onClick={handleButtonClick}
								title='Thêm ảnh'
							/>
						</Space>
					</Col>
				</Row>
			</Card>
		</div>
	);
};

export default PostButton;
