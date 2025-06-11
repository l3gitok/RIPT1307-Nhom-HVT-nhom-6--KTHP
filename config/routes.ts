import component from '@/locales/en-US/component';
import path from 'path';
export default [
	// ✅ Trang chính - Trang giới thiệu
    {
        path: '/',
        component: './TrangGioiThieu',
        layout: false, // Không sử dụng layout admin cho trang công khai
        exact: true,
    },
	{
		path: '/home',
		component: './TrangChu',
		layout: false, // Không sử dụng layout admin cho trang công khai
		exact: true,
	},
	{
		path: '/dang-theo-doi',
		component: './DangTheoDoi',
		layout: false, // Không sử dụng layout admin cho trang công khai
		exact: true,
	},
	{
		path: '/bang-xep-hang',
		component: './BangXepHang',
		layout: false, // Không sử dụng layout admin cho trang công khai
		exact: true,
	},
	{
      path: '/profile/:userId',
      component: '@/pages/UserProfile/index',
      layout: false, // Không sử dụng layout admin cho trang công khai
	  exact: true,
    },

	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/',
				redirect: '/user/login', 
			},
			{
				path: '/user/login',
				component: './user/Login/Login',
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
		path: 'admin/dashboard',
		name: 'Dashboard',
		component: './AdminDashBoard',
		icon: 'HomeOutlined',
	},

	{
		path: 'admin/quan_ly_user',
		name: 'User Management',
		component: './UserManager',
		icon: 'UserOutlined',
	},
	{
		path: 'admin/GameManager',
		name: 'Game Management',
		component: './GameManager',
		icon: 'AppstoreAddOutlined',
	},
	{
		path: 'admin/review-manager',
		name: 'Review Management',
		component: './ReviewManagement',
		icon: 'FileSearchOutlined',
	},
	{
		path: 'admin/report-manager',
		name: 'Report Management',
		component: './ReportManagement',
		icon: 'WarningOutlined',
	},
	 // Thêm route cho public user profile (không cần layout admin)
    
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
