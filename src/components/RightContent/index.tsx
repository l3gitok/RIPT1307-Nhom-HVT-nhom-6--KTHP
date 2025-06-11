import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { Avatar, Space } from 'antd';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const UserProfile: React.FC = () => {
    const { initialState } = useModel('@@initialState');
    const currentUser = initialState?.currentUser;
    const [userInfo, setUserInfo] = useState<any>(null);
    
    // Lấy thông tin user từ API
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                const response = await fetch('https://gamehubapi-test.onrender.com/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserInfo(data.user);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);
    
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

    // Lấy username từ userInfo, fallback về currentUser và cuối cùng là 'User'
    const userName = userInfo?.profile?.username;
                    
    const initials = getInitials(userName);
    const avatarColor = getAvatarColor(userName);

    return (
        <Space align="center" style={{ color: 'white' }}>
            <Avatar
                size={32}
                src={userInfo?.profile?.avatar_url} // Hiển thị avatar nếu có
                style={{ 
                    backgroundColor: avatarColor,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}
            >
                {!userInfo?.profile?.avatar_url && initials}
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
                <UserProfile />
                <AvatarDropdown />
            </Space>
        </div>
    );
};

export default GlobalHeaderRight;