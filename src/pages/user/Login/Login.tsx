import React, { useState } from 'react';
import { Form, Input, Button, message, Modal, Card, Space } from 'antd';
import { LockOutlined, UserOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
import { history } from 'umi';
import axios from 'axios';
import styles from '../Login/index.less';

const Login: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    // ✅ Thêm state cho modal lựa chọn role
    const [roleSelectionVisible, setRoleSelectionVisible] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);

    // Xử lý đăng nhập
    const handleSubmit = async (values: { email: string; password: string }) => {
        try {
            setSubmitting(true);

            // Gửi yêu cầu đăng nhập API
            const response = await axios.post('https://gamehubapi-test.onrender.com/api/auth/login', {
                email: values.email,
                password: values.password,
            });

            // Kiểm tra mã phản hồi API
            if (response.status === 200 && response?.data?.accessToken) {
                // Lưu token vào localStorage
                localStorage.setItem('accessToken', response?.data?.accessToken);
                localStorage.setItem('refreshToken', response?.data?.refreshToken);

                // Lưu thông tin người dùng nếu cần thiết
                const user = response?.data?.user;
                localStorage.setItem('user', JSON.stringify(user));

                message.success('Đăng nhập thành công!');

                // ✅ Kiểm tra role và hiển thị modal lựa chọn cho admin
                if (user?.role === 'admin') {
                    setUserInfo(user);
                    setRoleSelectionVisible(true);
                } else {
                    // User thường - điều hướng về trang chủ
                    history.push('/home');
                }
            } else {
                message.error('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin');
            }
        } catch (error) {
            message.error('Đăng nhập thất bại, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Xử lý lựa chọn role cho admin
    const handleRoleSelection = (selectedRole: 'admin' | 'user') => {
        setRoleSelectionVisible(false);
        
        if (selectedRole === 'admin') {
            // Vào với tư cách admin
            history.push('/admin/dashboard');
            message.success(`Chào mừng Admin ${userInfo?.profile?.username || userInfo?.email}!`);
        } else {
            // Vào với tư cách user thường
            history.push('/home');
            message.success(`Chào mừng ${userInfo?.profile?.username || userInfo?.email}!`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.top}>
                    <div className={styles.header}>
                        <img src='/sad.png' alt='logo' className={styles.logo} />
                    </div>
                </div>

                <div className={styles.main}>
                    <Form
                        form={form}
                        onFinish={handleSubmit}
                        layout='vertical' 
                        initialValues={{
                            email: '',
                            password: '',
                        }}
                    >
                        <Form.Item
                            label='Email'
                            name='email'
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input prefix={<UserOutlined className={styles.prefixIcon} />} placeholder='Nhập email' size='large' />
                        </Form.Item>

                        <Form.Item
                            label='Mật khẩu'
                            name='password'
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className={styles.prefixIcon} />}
                                placeholder='Nhập mật khẩu'
                                size='large'
                            />
                        </Form.Item>

                        <Button type='primary' htmlType='submit' block size='large' loading={submitting}>
                            Đăng nhập
                        </Button>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <Button type='link' onClick={() => history.push('/user/forgot-password')}>
                            Quên mật khẩu?
                        </Button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button type='link' onClick={() => history.push('/user/register')}>
                            Chưa có tài khoản? Đăng ký
                        </Button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <Button type='link' onClick={() => history.push('/')}>
                            ← Về trang chủ
                        </Button>
                    </div>
                </div>
            </div>

            {/* ✅ Modal lựa chọn role cho admin */}
            <Modal
                title={
                    <div style={{ textAlign: 'center' }}>
                        <CrownOutlined style={{ color: '#faad14', fontSize: '24px', marginRight: '8px' }} />
                        Chọn tư cách truy cập
                    </div>
                }
                visible={roleSelectionVisible}
                footer={null}
                closable={false}
                centered
                width={500}
                bodyStyle={{ padding: '30px 24px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
                        Xin chào, <strong>{userInfo?.profile?.username || userInfo?.email}</strong>!
                    </p>
                    <p style={{ color: '#888' }}>
                        Bạn có quyền Admin. Vui lòng chọn tư cách bạn muốn truy cập:
                    </p>
                </div>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Admin Option */}
                    <Card
                        hoverable
                        style={{ 
                            border: '2px solid #faad14',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #fff9e6 0%, #fff1b8 100%)'
                        }}
                        onClick={() => handleRoleSelection('admin')}
                        bodyStyle={{ padding: '24px', textAlign: 'center' }}
                    >
                        <CrownOutlined 
                            style={{ 
                                fontSize: '48px', 
                                color: '#faad14', 
                                marginBottom: '16px',
                                display: 'block'
                            }} 
                        />
                        <h3 style={{ margin: '0 0 8px 0', color: '#d48806' }}>
                            Quản trị viên
                        </h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            Truy cập bảng điều khiển quản trị, quản lý hệ thống
                        </p>
                    </Card>

                    {/* User Option */}
                    <Card
                        hoverable
                        style={{ 
                            border: '2px solid #1890ff',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
                        }}
                        onClick={() => handleRoleSelection('user')}
                        bodyStyle={{ padding: '24px', textAlign: 'center' }}
                    >
                        <TeamOutlined 
                            style={{ 
                                fontSize: '48px', 
                                color: '#1890ff', 
                                marginBottom: '16px',
                                display: 'block'
                            }} 
                        />
                        <h3 style={{ margin: '0 0 8px 0', color: '#096dd9' }}>
                            Người dùng
                        </h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            Trải nghiệm như một người dùng thông thường
                        </p>
                    </Card>
                </Space>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Button 
                        type="text" 
                        onClick={() => {
                            setRoleSelectionVisible(false);
                            // Logout và quay về trang login
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                            message.info('Đã hủy đăng nhập');
                        }}
                        style={{ color: '#999' }}
                    >
                        Hủy và đăng xuất
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Login;