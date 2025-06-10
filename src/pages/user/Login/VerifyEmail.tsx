import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Row, Col } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useLocation, useHistory } from 'umi';
import styles from '../Login/index.less';

const VerifyEmail = () => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const location = useLocation();
    const history = useHistory();

    // Lấy email từ query params, không dùng localStorage
    useEffect(() => {
        // @ts-ignore
        const queryEmail = location.query?.email;
        if (queryEmail) {
            setEmail(queryEmail);
        }
    }, [location]);

    const handleSubmit = async (values: { otp: string; email: string }) => {
        const otp = values.otp;
        const inputEmail = values.email || email;
        if (!/^\d{6}$/.test(otp)) {
            message.error('Mã OTP phải có 6 chữ số');
            return;
        }
        setSubmitting(true);
        try {
            console.log('Gửi xác thực:', { otp, inputEmail });
            const res = await fetch(
                `https://gamehubapi-test.onrender.com/api/auth/verify-email?otp=${otp}&email=${encodeURIComponent(inputEmail)}`
            );
            const data = await res.json();
            console.log('Kết quả API:', data); 
            if (res.ok && data.message === 'Xác nhận tài khoản qua OTP thành công') {
                message.success('Xác thực email thành công!');
                history.push('/user/login');
            } else {
                // Hiển thị rõ lỗi trả về từ API
                message.error(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } catch (error) {
            message.error('Mã OTP không hợp lệ. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('https://gamehubapi-test.onrender.com/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                message.success('Mã OTP mới đã được gửi đến email của bạn!');
            } else {
                message.error(data.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
            }
        } catch (error) {
            message.error('Không thể gửi lại mã OTP. Vui lòng thử lại.');
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
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <h2 style={{ color: '#333', marginBottom: '8px' }}>Xác thực Email</h2>
                            <p style={{ color: '#ffffff', fontSize: '14px' }}>
                            Chúng tôi đã gửi mã OTP đến email: <strong style={{ color: '#ffd700' }}>{email}</strong>
                        </p>
                        <p style={{ color: '#ffffff', fontSize: '14px' }}>Vui lòng nhập mã OTP để hoàn tất đăng ký.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.main}>
                    <Form
                        form={form}
                        onFinish={handleSubmit}
                        layout='vertical'
                        initialValues={{ email }}
                    >
                        <Form.Item
                            label="Mã OTP"
                            name='otp'
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP!' },
                                { len: 6, message: 'Mã OTP phải có 6 ký tự!', pattern: /^[0-9]+$/ },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className={styles.prefixIcon} />}
                                placeholder='Nhập mã OTP (6 chữ số)'
                                size='large'
                                maxLength={6}
                            />
                        </Form.Item>

                        <Button type='primary' htmlType='submit' block size='large' loading={submitting}>
                            Xác thực
                        </Button>
                    </Form>

                    <div style={{ marginTop: '20px' }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Button 
                                    block 
                                    size="large"
                                    onClick={() => history.push('/user/register')}
                                    style={{ 
                                        borderRadius: '8px',
                                        border: '1px solid #d9d9d9',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Quay lại đăng ký
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button 
                                    type='link' 
                                    block 
                                    size="large"
                                    disabled={submitting} 
                                    onClick={handleResendOTP}
                                    style={{ 
                                        color: '#667eea',
                                        fontWeight: 500,
                                        borderRadius: '8px'
                                    }}
                                >
                                    Gửi lại mã OTP
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;