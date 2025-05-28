import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Row, Col } from 'antd';
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
				`https://gamehubapi-test.onrender.com/api/auth/verify-email?otp=${otp}&email=${encodeURIComponent(inputEmail)}`,
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
		<div className={styles.main}>
			<Card title='Xác thực Email' bordered={false}>
				<p>
					Chúng tôi đã gửi mã OTP đến email: <strong>{email}</strong>
				</p>
				<p>Vui lòng nhập mã OTP để hoàn tất đăng ký.</p>

				<Form form={form} onFinish={handleSubmit} layout='vertical' initialValues={{ email }}>
					<Form.Item
						name='otp'
						rules={[
							{ required: true, message: 'Vui lòng nhập mã OTP!' },
							{ len: 6, message: 'Mã OTP phải có 6 ký tự!', pattern: /^[0-9]+$/ },
						]}
					>
						<Input prefix={<MailOutlined className={styles.prefixIcon} />} placeholder='Nhập mã OTP' size='large' />
					</Form.Item>

					<Form.Item>
						<Button type='primary' htmlType='submit' block size='large' loading={submitting}>
							Xác thực
						</Button>
					</Form.Item>

					<Row gutter={16}>
						<Col span={12}>
							<Button block onClick={() => history.push('/user/register')}>
								Quay lại đăng ký
							</Button>
						</Col>
						<Col span={12}>
							<Button type='link' block disabled={submitting} onClick={handleResendOTP}>
								Gửi lại mã OTP
							</Button>
						</Col>
					</Row>
				</Form>
			</Card>
		</div>
	);
};

export default VerifyEmail;
