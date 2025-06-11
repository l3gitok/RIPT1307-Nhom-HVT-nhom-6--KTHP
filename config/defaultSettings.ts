import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
  borderRadiusBase: string;
  siderWidth: number;
  user?: {
    _id?: string;
    avatar_url?: string;
    username?: string;
  }
} = {
  // === Thông tin ứng dụng ===
  title: '',
  logo: '/sad.png',

  // === Cấu hình header ===
  
  
  
  // === Cấu hình theme ===
  navTheme: 'light',
  headerTheme: 'dark', // Sử dụng theme tối cho header để tạo sự tương phản tốt hơn
  primaryColor: '#096dd9', // Màu xanh hiện đại hơn
  colorWeak: false,
  
  // === Cấu hình layout ===
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true, // Cố định header để UX tốt hơn
  fixSiderbar: true,
  
  // === Kích thước ===
  headerHeight: 64, // Tăng độ cao header để cân đối hơn
  siderWidth: 240, // Tăng độ rộng sidebar
  borderRadiusBase: '6px', // Bo góc mềm mại hơn
  
  // === Tính năng bổ sung ===
  pwa: true,
  iconfontUrl: '',
  
  // === Thông tin user mặc định ===
  user: {
    _id: '',
    avatar_url: '',
    username: 'Guest'
  }
};

export default Settings;