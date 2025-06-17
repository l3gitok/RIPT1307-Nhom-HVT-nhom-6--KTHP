import React, { useState } from 'react';
import { Modal, Form, Input, Rate, Select, Upload, Button, message, Progress, Space, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadMultipleImages } from '../../services/UploadServices';
import type { Game } from '../../services/GameServices';
import type { User } from '../../services/UserServices';

const { TextArea } = Input;
const { Option } = Select;

interface PostModalProps {
	visible: boolean;
	onCancel: () => void;
	form: any;
	games: Game[];
	currentUser: User | null;
	onSuccess: () => void;
	createNewReview?: (reviewData: any) => Promise<any>;
}

const PostModal: React.FC<PostModalProps> = ({
	visible,
	onCancel,
	form,
	games,
	currentUser,
	onSuccess,
	createNewReview,
}) => {
	const [postImages, setPostImages] = useState<string[]>([]);
	const [submittingPost, setSubmittingPost] = useState(false);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleImageUpload = async (files: File[]) => {
		if (files.length === 0) return;

		setUploadLoading(true);
		setUploadProgress(0);

		try {
			const urls = await uploadMultipleImages(files, (progress) => {
				setUploadProgress(progress);
			});

			setPostImages((prev) => [...prev, ...urls]);
			message.success(`Upload thành công ${urls.length} ảnh`);
		} catch (error: any) {
			console.error('Upload error:', error);
			message.error(error.message || 'Upload thất bại');
		} finally {
			setUploadLoading(false);
			setUploadProgress(0);
		}
	};

	const handleRemoveImage = (index: number) => {
		setPostImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (values: any) => {
		if (!currentUser) {
			message.error('Vui lòng đăng nhập để đăng bài');
			return;
		}
		setSubmittingPost(true);
		try {
			const reviewData = {
				content: values.content,
				rating: values.rating,
				game_id: values.game_id,
				images: postImages,
			};

			if (createNewReview) {
				await createNewReview(reviewData);
			}

			message.success('Đăng bài thành công!');
			form.resetFields();
			setPostImages([]);
			onSuccess();
		} catch (error: any) {
			console.error('Error creating review:', error);
			message.error(error.message || 'Đăng bài thất bại');
		} finally {
			setSubmittingPost(false);
		}
	};

	return (
		<Modal title='Viết review game' visible={visible} onCancel={onCancel} footer={null} width={600} destroyOnClose>
			<Form
				form={form}
				layout='vertical'
				onFinish={handleSubmit}
				initialValues={{
					rating: 5,
				}}
			>
				<Form.Item name='game_id' label='Chọn game' rules={[{ required: true, message: 'Vui lòng chọn game' }]}>
					{' '}
					<Select
						placeholder='Tìm kiếm và chọn game...'
						showSearch
						optionFilterProp='children'
						filterOption={(input, option) =>
							(option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
						}
					>
						{games.map((game) => (
							<Option key={game._id} value={game._id}>
								{game.title}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item name='rating' label='Đánh giá' rules={[{ required: true, message: 'Vui lòng đánh giá' }]}>
					<Rate allowHalf />
				</Form.Item>

				<Form.Item
					name='content'
					label='Nội dung review'
					rules={[
						{ required: true, message: 'Vui lòng nhập nội dung' },
						{ min: 10, message: 'Nội dung phải có ít nhất 10 ký tự' },
					]}
				>
					<TextArea rows={4} placeholder='Chia sẻ cảm nhận của bạn về game...' maxLength={1000} showCount />
				</Form.Item>

				<Form.Item label='Hình ảnh (tùy chọn)'>
					<div>
						<Upload
							multiple
							accept='image/*'
							beforeUpload={(file, fileList) => {
								handleImageUpload(fileList);
								return false; // Prevent default upload
							}}
							showUploadList={false}
							disabled={uploadLoading || postImages.length >= 4}
						>
							<Button
								icon={uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
								disabled={uploadLoading || postImages.length >= 4}
							>
								{uploadLoading ? 'Đang upload...' : 'Thêm ảnh'}
							</Button>
						</Upload>

						{uploadLoading && <Progress percent={uploadProgress} size='small' style={{ marginTop: 8 }} />}

						{postImages.length > 0 && (
							<div style={{ marginTop: 16 }}>
								<Space wrap>
									{postImages.map((url, index) => (
										<div key={url} style={{ position: 'relative' }}>
											<Image
												src={url}
												alt={`Upload ${index + 1}`}
												width={100}
												height={100}
												style={{ objectFit: 'cover', borderRadius: 8 }}
											/>
											<Button
												type='text'
												danger
												size='small'
												icon={<DeleteOutlined />}
												onClick={() => handleRemoveImage(index)}
												style={{
													position: 'absolute',
													top: 4,
													right: 4,
													background: 'rgba(0,0,0,0.5)',
													color: 'white',
													border: 'none',
												}}
											/>
										</div>
									))}
								</Space>
							</div>
						)}
					</div>
				</Form.Item>

				<Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
					<Space>
						<Button onClick={onCancel}>Hủy</Button>
						<Button type='primary' htmlType='submit' loading={submittingPost}>
							Đăng bài
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default PostModal;
