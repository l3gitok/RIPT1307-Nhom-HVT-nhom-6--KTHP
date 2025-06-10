import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { history } from 'umi';
import styles from '../Login/index.less';
import axios from 'axios';

const Register = () => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (values: { email: string; password: string; username: string }) => {
        try {
            setSubmitting(true);

            // Call the register API
            const response = await axios.post('https://gamehubapi-test.onrender.com/api/auth/register', {
                email: values.email,
                password: values.password,
                profile: {
                    username: values.username,
                },
            });

            if (response.status === 201) {
                message.success('Đăng ký thành công! Vui lòng xác thực email của bạn.');

                // Gửi email qua query params khi chuyển trang (lấy từ input)
                history.push({
                    pathname: '/user/verify-email',
                    query: { email: values.email },
                });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.top}>
                    <div className={styles.header}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src='/logo2.png' alt='logo' className={styles.logo} />
                            <span className={styles.title}>GAME HUB</span>
                        </div>
                    </div>
                </div>

                <div className={styles.main}>
                    <Form
                        form={form}
                        onFinish={handleSubmit}
                        layout='vertical'
                        initialValues={{
                            email: '',
                            username: '',
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
                            <Input prefix={<MailOutlined className={styles.prefixIcon} />} placeholder='Nhập email' size='large' />
                        </Form.Item>

                        <Form.Item
                            label='Tên người dùng'
                            name='username'
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên người dùng!' },
                                { min: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự!' },
                            ]}
                        >
                            <Input prefix={<UserOutlined className={styles.prefixIcon} />} placeholder='Nhập tên người dùng' size='large' />
                        </Form.Item>

                        <Form.Item
                            label='Mật khẩu'
                            name='password'
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined className={styles.prefixIcon} />} placeholder='Nhập mật khẩu' size='large' />
                        </Form.Item>

                        <Button type='primary' htmlType='submit' block size='large' loading={submitting}>
                            Đăng ký
                        </Button>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button type='link' onClick={() => history.push('/user/login')}>
                            Đã có tài khoản? Đăng nhập
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;