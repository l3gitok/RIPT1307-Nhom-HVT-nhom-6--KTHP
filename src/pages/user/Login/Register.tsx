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
        <div className={styles.main}>
            <h2>Đăng ký tài khoản</h2>

            <Form form={form} onFinish={handleSubmit} layout='vertical'>
                <Form.Item
                    name='email'
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                >
                    <Input prefix={<MailOutlined className={styles.prefixIcon} />} placeholder='Email' size='large' />
                </Form.Item>

                <Form.Item
                    name='username'
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên người dùng!' },
                        { min: 3, message: 'Tên người dùng phải có ít nhất 3 ký tự!' },
                    ]}
                >
                    <Input prefix={<UserOutlined className={styles.prefixIcon} />} placeholder='Tên người dùng' size='large' />
                </Form.Item>

                <Form.Item
                    name='password'
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                    ]}
                >
                    <Input.Password prefix={<LockOutlined className={styles.prefixIcon} />} placeholder='Mật khẩu' size='large' />
                </Form.Item>

                <Form.Item>
                    <Button type='primary' htmlType='submit' block size='large' loading={submitting}>
                        Đăng ký
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    <Button type='link' onClick={() => history.push('/user/login')}>
                        Đã có tài khoản? Đăng nhập
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Register;