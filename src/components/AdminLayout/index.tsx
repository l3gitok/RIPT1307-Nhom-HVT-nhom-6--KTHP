import React from 'react';
import { Layout, Menu } from 'antd';
import { history, useLocation } from 'umi';
import { UserOutlined, AppstoreOutlined, FileSearchOutlined, WarningOutlined } from '@ant-design/icons';

const { Content } = Layout;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const location = useLocation();

	const goToDashboard = () => {
		history.push('/dashboard');
	};

	const items = [
		{
			key: '/admin/quan_ly_user',
			icon: <UserOutlined />,
			label: 'User Management',
			onClick: () => history.push('/admin/quan_ly_user'),
			style: { height: '50px', display: 'flex', alignItems: 'center' },
		},
		{
			key: '/admin/GameManager',
			icon: <AppstoreOutlined />,
			label: 'Game Management',
			onClick: () => history.push('/admin/GameManager'),
			style: { height: '50px', display: 'flex', alignItems: 'center' },
		},
		{
			key: '/admin/review-manager',
			icon: <FileSearchOutlined />,
			label: 'Review Management',
			onClick: () => history.push('/admin/review-manager'),
			style: { height: '50px', display: 'flex', alignItems: 'center' },
		},
		{
			key: '/admin/report-manager',
			icon: <WarningOutlined />,
			label: 'Report Management',
			onClick: () => history.push('/admin/report-manager'),
			style: { height: '50px', display: 'flex', alignItems: 'center' },
		},
	];

	return (
		<Layout style={{ minHeight: '100vh', background: '#fff' }}>
			<div
				style={{
					background: '#120C0C',
					height: '54px',
					width: '100%',
					position: 'fixed',
					top: 0,
					left: 0,
					zIndex: 1000,
					padding: '7px 24px',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<div
					onClick={goToDashboard}
					style={{
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<img
						src='https://c.animaapp.com/mb36s6z6gMvutO/img/untitled-1-1.png'
						alt='GAMEHUB'
						style={{
							height: '40px',
						}}
					/>
				</div>
			</div>{' '}
			<Layout style={{ paddingTop: '54px', background: '#fff' }}>
				<Menu
					mode='inline'
					selectedKeys={[location.pathname]}
					style={{
						width: '250px',
						minHeight: 'calc(100vh - 54px)',
						background: '#fff',
						borderRight: '1px solid #f0f0f0',
						position: 'fixed',
						left: 0,
						top: '54px',
					}}
					items={items}
				/>
				<Layout style={{ marginLeft: '250px', background: '#fff' }}>
					<Content style={{ padding: '24px', minHeight: 'calc(100vh - 54px)' }}>{children}</Content>
				</Layout>
			</Layout>
		</Layout>
	);
};

export default AdminLayout;
