import { Button, Col, Image, Row, Input, Dropdown, Menu, Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { history } from 'umi';

const { Header } = Layout;

export interface GameHubHeaderProps {
	searchText: string;
	setSearchText: (text: string) => void;
	activeNav: number;
	setActiveNav: (key: number) => void;
	userMenu?: React.ReactElement | (() => React.ReactElement);
	NAV_ITEMS: { label: string; key: number }[];
}

const GameHubHeader: React.FC<GameHubHeaderProps> = ({
	searchText,
	setSearchText,
	activeNav,
	setActiveNav,
	NAV_ITEMS,
}) => {
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		setUser(storedUser ? JSON.parse(storedUser) : null);
	}, []);
	const handleLogout = () => {
		localStorage.removeItem('user');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		setUser(null);
		history.push('/dashboard');
	};
	const adminMenu = (
		<Menu>
			<Menu.Item key='profile'>
				<a href='/profile'>Thông tin người dùng</a>
			</Menu.Item>
			<Menu.Item key='admin'>
				<a href='/admin'>Quản lí hệ thống</a>
			</Menu.Item>
			<Menu.Item key='logout' onClick={handleLogout}>
				Đăng xuất
			</Menu.Item>
		</Menu>
	);

	const userMenu = (
		<Menu>
			<Menu.Item key='profile'>
				<a href='/profile'>Thông tin người dùng</a>
			</Menu.Item>
			<Menu.Item key='logout' onClick={handleLogout}>
				Đăng xuất
			</Menu.Item>
		</Menu>
	);

	const guestMenu = (
		<Menu>
			<Menu.Item key='register' onClick={() => history.push('/user/register')}>
				Đăng ký
			</Menu.Item>
			<Menu.Item key='login' onClick={() => history.push('/user/login')}>
				Đăng nhập
			</Menu.Item>
		</Menu>
	);

	return (
		<>
			<Header
				style={{
					background: '#120C0C',
					padding: 0,
					height: '54px',
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					zIndex: 100,
				}}
			>
				<Row align='middle' justify='space-between' style={{ height: '100%' }}>
					<Col style={{ marginLeft: '13px' }}>
						<a
							href='/dashboard'
							style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', outline: 'none' }}
							onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'none')}
							onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
						>
							<Image
								preview={false}
								src='https://c.animaapp.com/mb36s6z6gMvutO/img/untitled-1-1.png'
								alt='Untitled'
								style={{ width: '205px', height: '40px' }}
							/>
						</a>
					</Col>
					<Col
						flex='auto'
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							marginRight: '160px',
							marginBottom: '7px',
						}}
					>
						<Input
							className='custom-search-input'
							placeholder='Tìm kiếm'
							prefix={<SearchOutlined />}
							style={{
								width: '400px',
								height: '40px',
								borderRadius: '30px',
							}}
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
						/>
					</Col>
					<Col style={{ marginRight: '13px' }}>
						<Dropdown
							overlay={user ? (user.role === 'admin' ? adminMenu : userMenu) : guestMenu}
							placement='bottomRight'
							arrow
						>
							<Button
								icon={<UserOutlined />}
								style={{
									width: '41px',
									height: '41px',
									borderRadius: '50%',
									color: user ? '#1890ff' : undefined,
									background: user ? '#e6f7ff' : undefined,
								}}
							/>
						</Dropdown>
					</Col>
				</Row>
			</Header>
		</>
	);
};

export default GameHubHeader;
