import { useState, useEffect } from 'react';
import { ReviewService } from '@/services';
import { Form, Input, Rate, Select, Button, message, Card } from 'antd';
import type { Game } from '@/services/GameServices';
import axios from '@/utils/axios';
import { StarOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function CreateReview() {
	const [form] = Form.useForm();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const token = localStorage.getItem('accessToken');

	useEffect(() => {
		const fetchGames = async () => {
			setLoading(true);
			try {
				const response = await axios.get('https://gamehubapi-test.onrender.com/api/games');
				if (response.data?.games) {
					setGames(response.data.games);
				}
			} catch (error) {
				message.error('Không thể tải danh sách game');
			}
			setLoading(false);
		};

		fetchGames();
	}, []);

	const handleSubmit = async (values: any) => {
		if (!token) {
			message.error('Bạn cần đăng nhập để đánh giá game');
			return;
		}

		setSubmitting(true);
		try {
			await ReviewService.createReview(
				{
					game_id: values.game_id,
					content: values.content,
					rating: values.rating,
				},
				token,
			);
			message.success('Đăng bài đánh giá thành công!');
			form.resetFields();
		} catch (error) {
			message.error('Có lỗi khi đăng bài đánh giá');
		}
		setSubmitting(false);
	};

	return (
		<Card
			title={<h2 style={{ margin: 0 }}>Đánh giá game</h2>}
			style={{
				maxWidth: 800,
				margin: '20px auto',
				boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
			}}
		>
			<Form
				form={form}
				layout='vertical'
				onFinish={handleSubmit}
				initialValues={{ rating: 5 }}
				style={{ padding: '20px 0' }}
			>
				<Form.Item
					name='game_id'
					label='Chọn game'
					rules={[{ required: true, message: 'Vui lòng chọn game' }]}
					style={{ marginBottom: '24px' }}
				>
					<Select
						loading={loading}
						placeholder='Chọn game cần đánh giá'
						optionFilterProp='children'
						showSearch
						style={{ width: '100%' }}
						filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
						options={games.map((game) => ({
							value: game._id,
							label: game.title,
						}))}
					/>
				</Form.Item>

				<Form.Item
					name='rating'
					label='Đánh giá'
					rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
					style={{ marginBottom: '24px' }}
				>
					<Rate character={<StarOutlined />} style={{ fontSize: '24px', color: '#fadb14' }} />
				</Form.Item>

				<Form.Item
					name='content'
					label='Nội dung đánh giá'
					rules={[
						{ required: true, message: 'Vui lòng nhập nội dung đánh giá' },
						{ min: 10, message: 'Nội dung đánh giá phải có ít nhất 10 ký tự' },
						{ max: 2000, message: 'Nội dung đánh giá không được vượt quá 2000 ký tự' },
					]}
				>
					<TextArea
						rows={4}
						placeholder='Hãy chia sẻ trải nghiệm của bạn về game này...'
						maxLength={2000}
						showCount
						style={{ resize: 'vertical' }}
					/>
				</Form.Item>

				<Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
					<Button type='primary' htmlType='submit' loading={submitting} size='large'>
						Đăng bài đánh giá
					</Button>
				</Form.Item>
			</Form>
		</Card>
	);
}
