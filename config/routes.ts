import component from '@/locales/en-US/component';
import path from 'path';
export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user/register',
				layout: false,
				name: 'register',
				component: './user/Login/Register',
			},
			{
				name: 'verify-email',
				layout: false,
				path: '/user/verify-email',
				component: './user/Login/VerifyEmail',
			},
			{
				name: 'forgot-password',
				layout: false,
				path: '/user/forgot-password',
				component: './user/Login/ForgotPassWord',
			},
			{
				name: 'reset-password',
				layout: false,
				path: '/user/reset-password',
				component: './user/Login/ResetPassword',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/admin',
		name: 'Admin',
		component: '@/components/AdminLayout',
		routes: [
			{
				path: '/admin',
				redirect: '/admin/quan_ly_user',
			},
			{
				path: '/admin/quan_ly_user',
				name: 'User Management',
				component: './UserManager',
				icon: 'UserOutlined',
			},
			{
				path: '/admin/GameManager',
				name: 'Game Management',
				component: './GameManager',
				icon: 'AppstoreAddOutlined',
			},
			{
				path: '/admin/review-manager',
				name: 'Review Management',
				component: './ReviewManagement',
				icon: 'FileSearchOutlined',
			},
			{
				path: '/admin/report-manager',
				name: 'Report Management',
				component: './ReportManagement',
				icon: 'WarningOutlined',
			},
		],
	},
	{
		path: '/profile',
		name: 'Thông tin cá nhân',
		component: './NguoiDung',
	},
	{
		path: '/bang-xep-hang',
		name: 'Bảng Xếp Hạng',
		component: './BangXepHang',
	},
	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
