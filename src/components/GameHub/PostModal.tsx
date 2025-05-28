import { Modal, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ReviewService, UploadService } from '@/services';

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
	const handlePost = async () => {
		if (!postContent) return;
		let imageUrls: string[] = [];
		if (postImages.length > 0) {
			imageUrls = await Promise.all(
				postImages.map(async (img: string) => {
					// Convert base64 to File
					const arr = img.split(',');
					const mime = arr[0].match(/:(.*?);/)?.[1] || '';
					const bstr = atob(arr[1]);
					let n = bstr.length;
					const u8arr = new Uint8Array(n);
					while (n--) u8arr[n] = bstr.charCodeAt(n);
					const file = new File([u8arr], 'image.png', { type: mime });
					const res = await UploadService.uploadImage(file, localStorage.getItem('token')!);
					return res.data.url;
				}),
			);
		}
		try {
			await ReviewService.createReview(
				{
					game_id: 'ID_GAME', // TODO: lấy từ input hoặc props
					content: postContent,
					rating: 5, // TODO: lấy từ input hoặc props
					images: imageUrls,
				},
				localStorage.getItem('token')!,
			);
			message.success('Đăng bài thành công!');
			setPostContent('');
			setPostImages([]);
			onCancel();
		} catch (e) {
			message.error('Có lỗi khi đăng bài');
		}
	};

	return (
		<Modal
			visible={visible}
			onCancel={onCancel}
			footer={null}
			width={650}
			bodyStyle={{ background: '#f5f5f5', borderRadius: 20, padding: 32, position: 'relative' }}
			style={{ top: 100, background: 'transparent', boxShadow: 'none', padding: 0 }}
			closable={false}
		>
			<div style={{ position: 'relative' }}>
				<Button
					onClick={onCancel}
					style={{
						position: 'absolute',
						top: 8,
						right: 12,
						zIndex: 2,
						background: 'transparent',
						border: 'none',
						fontSize: 22,
					}}
				>
					×
				</Button>
				<div style={{ marginBottom: 16 }}>
					<Upload multiple showUploadList={false} beforeUpload={() => false} onChange={handleUpload} accept='image/*'>
						<Button icon={<UploadOutlined />}>Chọn ảnh</Button>
					</Upload>
					{Array.isArray(postImages) && postImages.length > 0 && (
						<div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
							{postImages.map((img, idx) => (
								<img
									key={idx}
									src={img}
									alt='preview'
									style={{ maxWidth: 120, maxHeight: 90, borderRadius: 12, boxShadow: '0 2px 8px #ccc' }}
								/>
							))}
						</div>
					)}
				</div>
				<ReactQuill
					value={postContent}
					onChange={setPostContent}
					style={{ height: 250, marginBottom: 20, background: '#fff', borderRadius: 8 }}
				/>
				<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
					<Button type='primary' disabled={!postContent} onClick={handlePost}>
						Đăng bài
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default PostModal;
