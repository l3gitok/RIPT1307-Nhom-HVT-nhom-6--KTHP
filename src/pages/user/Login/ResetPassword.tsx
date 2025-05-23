import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useLocation, history } from 'umi';
import styles from '../Login/index.less';

const ResetPassword = () => {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const location = useLocation();

    // Lấy token từ query params (?token=...)
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (!token) {
            message.error('Thiếu token xác thực. Vui lòng kiểm tra lại email.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('https://gamehubapi-test.onrender.com/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: values.newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
                history.push('/user/login');
            } else {
                message.error(data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.main}>
            <Card title="Đặt lại mật khẩu" bordered={false}>
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className={styles.prefixIcon} />}
                            placeholder="Nhập mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className={styles.prefixIcon} />}
                            placeholder="Xác nhận mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ResetPassword;