import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
	pwa?: boolean;
	logo?: string;
	borderRadiusBase: string;
	siderWidth: number;
} = {
	navTheme: 'light',
	primaryColor: '#1677ff',
	borderRadiusBase: '2px',
	layout: 'mix',
	contentWidth: 'Fluid',
	fixedHeader: false,
	fixSiderbar: true,
	colorWeak: false,
	pwa: false,
	iconfontUrl: '',
	headerTheme: 'light',
	headerHeight: 60,
	siderWidth: 220,
	title: '',
	logo: '',
};

export default Settings;
