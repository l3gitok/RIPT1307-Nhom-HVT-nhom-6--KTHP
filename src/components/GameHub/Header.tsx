import { Button, Col, Image, Row, Input, Dropdown, Menu, Layout, Avatar, Typography, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchOutlined, UserOutlined, LogoutOutlined, SettingOutlined, DashboardOutlined } from '@ant-design/icons';
import { history } from 'umi';
import './Header.less';

const { Header } = Layout;
const { Text } = Typography;

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
        history.push('/home');
    };

    // ✅ Navigate to user profile
    const handleProfileClick = () => {
        if (user?._id) {
            history.push(`/profile/${user._id}`);
        }
    };

    // ✅ Navigate to admin dashboard
    const handleAdminDashboard = () => {
        history.push('/admin/dashboard');
    };

    // ✅ Admin menu with enhanced options
    const adminMenu = (
        <Menu>
            <Menu.Item key='profile' icon={<UserOutlined />} onClick={handleProfileClick}>
                Thông tin người dùng
            </Menu.Item>
            <Menu.Item key='admin' icon={<DashboardOutlined />} onClick={handleAdminDashboard}>
                Admin Dashboard
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key='logout' icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    // ✅ Regular user menu
    const userMenu = (
        <Menu>
            <Menu.Item key='profile' icon={<UserOutlined />} onClick={handleProfileClick}>
                Thông tin người dùng
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key='logout' icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    // ✅ Guest menu for non-logged users
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

    // ✅ Get username display
    const getUsername = () => {
        if (user?.profile?.username) {
            return user.profile.username;
        } else if (user?.email) {
            return user.email.split('@')[0]; // Use part before @ as username
        }
        return 'User';
    };

    // ✅ Render user section
    const renderUserSection = () => {
        if (!user) {
            // ✅ Guest user - show simple button
            return (
                <Dropdown
                    overlay={guestMenu}
                    placement='bottomRight'
                    arrow
                >
                    <Button
                        icon={<UserOutlined />}
                        style={{
                            width: '41px',
                            height: '41px',
                            borderRadius: '50%',
                            border: '1px solid #d9d9d9'
                        }}
                    />
                </Dropdown>
            );
        }

        // ✅ Logged in user - show avatar + username
        return (
            <Dropdown
                overlay={user.role === 'admin' ? adminMenu : userMenu}
                placement='bottomRight'
                arrow
            >
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    {/* ✅ Avatar - clickable to profile */}
                    <span
                        style={{ display: 'inline-block', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown from opening
                            handleProfileClick();
                        }}
                    >
                        <Avatar
                            src={user.profile?.avatar_url}
                            icon={<UserOutlined />}
                            size={32}
                            style={{ 
                                cursor: 'pointer',
                                border: '2px solid rgba(255, 255, 255, 0.3)'
                            }}
                        />
                    </span>
                    
                    {/* ✅ Username */}
                    <Space direction="vertical" size={0} style={{ lineHeight: 1 }}>
                        <Text 
                            style={{ 
                                color: 'white', 
                                fontSize: '14px', 
                                fontWeight: 500,
                                marginBottom: 0
                            }}
                        >
                            {getUsername()}
                        </Text>
                        {user.role === 'admin' && (
                            <Text 
                                style={{ 
                                    color: '#ffd700', 
                                    fontSize: '10px',
                                    fontWeight: 400,
                                    marginTop: '-2px'
                                }}
                            >
                                Admin
                            </Text>
                        )}
                    </Space>
                </div>
            </Dropdown>
        );
    };

    return (
        <>
            <Header
                className='gamehub-header'
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
                    {/* ✅ Logo */}
                    <Col style={{ marginLeft: '13px' }}>
                        <a
                            href='/home'  // ✅ Updated to point to /home
                            className='not-underline'
                            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', outline: 'none' }}
                            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'none')}
                            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                            <Image
                                preview={false}
                                src='https://c.animaapp.com/mb36s6z6gMvutO/img/untitled-1-1.png'
                                alt='GameHub Logo'
                                style={{ width: '205px', height: '40px' }}
                            />
                        </a>
                    </Col>

                    {/* ✅ Search Bar */}
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
                            placeholder='Tìm kiếm games, users...'
                            prefix={<SearchOutlined />}
                            style={{
                                width: '400px',
                                height: '40px',
                                borderRadius: '30px',
                            }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={() => {
                                if (searchText.trim()) {
                                    history.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
                                }
                            }}
                        />
                    </Col>

                    {/* ✅ User Section */}
                    <Col style={{ marginRight: '13px' }}>
                        {renderUserSection()}
                    </Col>
                </Row>
            </Header>
        </>
    );
};

export default GameHubHeader;