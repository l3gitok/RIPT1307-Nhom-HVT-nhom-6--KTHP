import { Modal, Button, Upload, message, Form, Select, Rate, Alert } from 'antd';
import { UploadOutlined, StarOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ReviewService, UploadService } from '@/services';
import type { Game } from '@/services/GameServices';
import axios from '@/utils/axios';

// Hàm loại bỏ thẻ HTML từ nội dung
const removeHtmlTags = (html: string) => {
	if (!html) return '';
	return html.replace(/<\/?[^>]+(>|$)/g, '');
};

interface PostModalProps {
	visible: boolean;
	onCancel: () => void;
	postContent: string;
	setPostContent: (v: string) => void;
	postImages: string[];
	setPostImages: (imgs: string[]) => void;
	handleUpload: (info: any) => void;
}

const PostModal: React.FC<PostModalProps> = ({
	visible,
	onCancel,
	postContent,
	setPostContent,
	postImages,
	setPostImages,
	handleUpload,
}) => {
	const [form] = Form.useForm();
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedGame, setSelectedGame] = useState<string>('');
	const [rating, setRating] = useState<number>(5);

	useEffect(() => {
		const fetchGames = async () => {
			setLoading(true);
			try {
				const response = await axios.get('https://gamehubapi-test.onrender.com/api/games');
				if (response.data?.data) {
					setGames(response.data.data);
				}
			} catch (error) {
				message.error('Không thể tải danh sách game');
			}
			setLoading(false);
		};

		if (visible) {
			fetchGames();
		}
	}, [visible]);

	const handlePost = async () => {
		const token = localStorage.getItem('accessToken');

		if (!token) {
			message.error('Vui lòng đăng nhập để đánh giá game');
			return;
		}

		if (!selectedGame || !postContent) {
			message.error('Vui lòng chọn game và nhập nội dung đánh giá');
			return;
		}

		setLoading(true);
		try {
			let imageUrls: string[] = [];

			// Upload images if any
			if (postImages.length > 0) {
				message.loading('Đang tải ảnh lên...', 0);

				try {
					const uploadPromises = postImages.map(async (img: string) => {
						// Convert base64 to File
						const arr = img.split(',');
						const mime = arr[0].match(/:(.*?);/)?.[1] || '';
						const bstr = atob(arr[1]);
						let n = bstr.length;
						const u8arr = new Uint8Array(n);
						while (n--) u8arr[n] = bstr.charCodeAt(n);

						const fileName = `review-image-${Date.now()}-${Math.random().toString(36).substring(7)}.${
							mime.split('/')[1] || 'png'
						}`;
						const file = new File([u8arr], fileName, { type: mime });

						const response = await UploadService.uploadImage(file, token);
						if (!response.data?.data?.url) {
							throw new Error('Không nhận được URL ảnh từ server');
						}
						return response.data.data.url;
					});

					imageUrls = await Promise.all(uploadPromises);
					message.destroy(); // Clear loading message
				} catch (error: any) {
					message.destroy(); // Clear loading message
					if (error.message.includes('Phiên đăng nhập')) {
						message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
						// Thêm logic chuyển đến trang đăng nhập nếu cần
						return;
					}
					message.error('Có lỗi khi tải ảnh lên. Vui lòng thử lại.');
					setLoading(false);
					return;
				}
			} // Create review - loại bỏ thẻ HTML từ nội dung
			const reviewData = {
				game_id: selectedGame,
				content: removeHtmlTags(postContent),
				rating: rating,
				images: imageUrls,
			};

			await ReviewService.createReview(reviewData, token);

			message.success('Đã gửi bài đánh giá thành công! Vui lòng chờ admin duyệt bài.');
			setPostContent('');
			setPostImages([]);
			setSelectedGame('');
			setRating(5);
			form.resetFields();
			onCancel();
		} catch (error: any) {
			if (error.response?.status === 401) {
				message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
				return;
			}
			const errorMessage =
				error.response?.data?.message || error.message || 'Có lỗi khi gửi bài đánh giá. Vui lòng thử lại sau.';
			message.error(errorMessage);
			console.error('Error posting review:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={
				<div style={{ position: 'relative' }}>
					<span>Đánh giá game</span>
					<Alert
						message='Thông báo'
						description='Bài đánh giá của bạn sẽ được gửi cho admin xét duyệt trước khi hiển thị công khai.'
						type='info'
						showIcon
						style={{ marginTop: 10 }}
					/>
				</div>
			}
			visible={visible}
			onCancel={onCancel}
			footer={null}
			width={650}
			bodyStyle={{
				background: '#f5f5f5',
				borderRadius: 20,
				padding: '20px 32px',
				position: 'relative',
				marginTop: 20,
			}}
			style={{
				top: 50,
				background: 'transparent',
				boxShadow: 'none',
				padding: 0,
			}}
		>
			<div style={{ position: 'relative' }}>
				<Form form={form} layout='vertical' style={{ marginBottom: 20 }}>
					<Form.Item name='game_id' label='Chọn game' rules={[{ required: true, message: 'Vui lòng chọn game' }]}>
						<Select
							loading={loading}
							placeholder='Chọn game cần đánh giá'
							optionFilterProp='children'
							showSearch
							value={selectedGame}
							onChange={(value) => setSelectedGame(value)}
							filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
							options={games.map((game) => ({
								value: game._id,
								label: game.title,
							}))}
							style={{ width: '100%' }}
						/>
					</Form.Item>

					<Form.Item name='rating' label='Đánh giá' rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
						<Rate
							character={<StarOutlined />}
							value={rating}
							onChange={(value) => setRating(value)}
							style={{ fontSize: '24px', color: '#fadb14' }}
						/>
					</Form.Item>
				</Form>

				<div style={{ marginBottom: 16 }}>
					<Upload multiple showUploadList={false} beforeUpload={() => false} onChange={handleUpload} accept='image/*'>
						<Button icon={<UploadOutlined />}>Chọn ảnh</Button>
					</Upload>
					{Array.isArray(postImages) && postImages.length > 0 && (
						<div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
							{' '}
							{postImages.map((img) => (
								<img
									key={`img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`}
									src={img}
									alt='preview'
									style={{ maxWidth: 120, maxHeight: 90, borderRadius: 12, boxShadow: '0 2px 8px #ccc' }}
								/>
							))}
						</div>
					)}
				</div>

				<div style={{ marginBottom: 20 }}>
					<div style={{ marginBottom: 8, fontWeight: 500 }}>Nội dung đánh giá</div>
					<ReactQuill
						value={postContent}
						onChange={setPostContent}
						style={{
							height: 200,
							background: '#fff',
							borderRadius: 8,
							marginBottom: 40,
						}}
						placeholder='Hãy chia sẻ trải nghiệm của bạn về game này...'
					/>
				</div>

				<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
					<Button
						type='primary'
						disabled={!postContent || !selectedGame || loading}
						onClick={handlePost}
						size='large'
						loading={loading}
					>
						Đăng bài đánh giá
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default PostModal;
