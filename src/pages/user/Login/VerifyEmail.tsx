import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Row, Col } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import styles from '../Login/index.less';
import axios from 'axios';

const VerifyEmail = () => {
	const [form] = Form.useForm();
	const [submitting, setSubmitting] = useState(false);
	const [email, setEmail] = useState('');
	const history = useHistory();

	// Load email từ localStorage
	useEffect(() => {
		const storedEmail = localStorage.getItem('verification_email');
		console.log('Email được lưu:', storedEmail); // Gỡ lỗi
		if (!storedEmail) {
			message.error('Không tìm thấy thông tin email, vui lòng đăng ký lại');
			history.push('/user/register');
			return;
		}
		setEmail(storedEmail);
	}, [history]);

	const handleSubmit = async (values: { otp: string }) => {
		try {
			setSubmitting(true);

			// Kiểm tra định dạng OTP: 6 chữ số
			if (!/^\d{6}$/.test(values.otp)) {
				message.error('Mã OTP phải có 6 chữ số');
				return;
			}
			// Gửi yêu cầu GET
			const storedEmail = localStorage.getItem('verification_email');
			const response = await fetch(
				`http://localhost:5000/api/auth/verify-email?otp=${values.otp}&email=${storedEmail}`,
			);
			const data = await response.json();

			if (response.status === 200 || response.status === 201) {
				if (data.message === 'Xác nhận tài khoản qua OTP thành công') {
					message.success('Xác thực email thành công!');
					localStorage.removeItem('verification_email');
					history.push('/user/login');
				} else {
					message.error(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
				}
			} else {
				message.error(data.message || 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
			}
		} catch (error: any) {
			console.error('Chi tiết lỗi:', {
				status: error.response?.status,
				data: error.response?.data,
				message: error.message,
				config: error.config,
			});
			message.error(error.response?.data?.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleResendOTP = async () => {
		try {
			setSubmitting(true);
			console.log('Đang gửi lại OTP cho email:', email); // Gỡ lỗi
			const response = await axios.post('https://gamehubapi-test.onrender.com/api/auth/resend-otp', {
				email: email,
			});
			if (response.status === 200 || response.status === 201) {
				message.success('Mã OTP mới đã được gửi đến email của bạn!');
			}
		} catch (error: any) {
			console.error('Lỗi gửi lại OTP:', error.response || error);
			message.error(error.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
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

				<Form form={form} onFinish={handleSubmit} layout='vertical'>
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
