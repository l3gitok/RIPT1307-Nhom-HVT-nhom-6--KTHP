import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history } from 'umi';
import axios from 'axios';
import styles from '../Login/index.less';

const Login: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const [form] = Form.useForm();

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

				// Thực hiện hành động sau khi đăng nhập thành công (như lấy thông tin người dùng)
				message.success('Đăng nhập thành công!');
				history.push('/'); // Điều hướng đến trang dashboard hoặc trang bạn muốn sau khi đăng nhập thành công
			} else {
				message.error('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin');
			}
		} catch (error) {
			message.error('Đăng nhập thất bại, vui lòng thử lại.');
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
							<img alt='logo' className={styles.logo} src='/logo-full.svg' />
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

					<div style={{ textAlign: 'center', marginTop: '20px' }}>
						<Button type='link' onClick={() => history.push('/user/register')}>
							Chưa có tài khoản? Đăng ký
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
