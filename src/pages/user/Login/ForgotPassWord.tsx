import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { history } from 'umi';
import styles from '../Login/index.less';

const ForgotPassword = () => {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: { email: string }) => {
        setSubmitting(true);
        try {
            const res = await fetch('https://gamehubapi-test.onrender.com/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email }),
            });
            const data = await res.json();
            if (res.ok) {
                message.success('Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!');
                history.push('/user/login');
            } else {
                message.error(data.message || 'Không thể gửi email. Vui lòng thử lại.');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.main}>
            <Card title="Quên mật khẩu" bordered={false}>
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className={styles.prefixIcon} />}
                            placeholder="Nhập email của bạn"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                            Gửi yêu cầu
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ForgotPassword;