import React from 'react';
import { useModel } from 'umi';
import { Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const UserProfile: React.FC = () => {
    const { initialState } = useModel('@@initialState');
    const currentUser = initialState?.currentUser;
    
    // Lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return names[0][0].toUpperCase();
    };
    
    // Tạo màu background ngẫu nhiên dựa trên tên
    const getAvatarColor = (name: string) => {
        const colors = [
            '#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#f50', 
            '#108ee9', '#87d068', '#eb2f96', '#1890ff', '#722ed1',
            '#fa541c', '#13c2c2', '#52c41a', '#fa8c16', '#1677ff'
        ];
        if (!name) return colors[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const userName = currentUser?.name || 'User';
    const initials = getInitials(userName);
    const avatarColor = getAvatarColor(userName);

    return (
        <Space align="center" style={{ color: 'white' }}>
            <Avatar
                size={32}
                style={{ 
                    backgroundColor: avatarColor,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}
                // src={currentUser?.avatar}
            >
                {initials}
            </Avatar>
            <span style={{ fontSize: '14px' }}>
                {userName}
            </span>
        </Space>
    );
};

const GlobalHeaderRight: React.FC = () => {
    const { initialState } = useModel('@@initialState');

    return (
        <div className={styles.right}>
            <Space align="center" size="large">
                <h1 style={{ color: 'white', fontSize: '20px', margin: 0 }}>Olecgema</h1>
                <UserProfile />
                <AvatarDropdown />
            </Space>
        </div>
    );
};

export default GlobalHeaderRight;