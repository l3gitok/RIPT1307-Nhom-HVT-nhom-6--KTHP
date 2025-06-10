import { useEffect, useState } from 'react';
import { ReviewService } from '@/services';
import type { Review } from '@/services/ReviewServices';
import { Card, Rate, Avatar, Typography, Image, Space, Button, message } from 'antd';
import {
	LikeOutlined,
	DislikeOutlined,
	CommentOutlined,
	ShareAltOutlined,
	LikeFilled,
	DislikeFilled,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

// Hàm loại bỏ thẻ HTML từ nội dung
const removeHtmlTags = (html: string) => {
	if (!html) return '';
	return html.replace(/<\/?[^>]+(>|$)/g, '');
};

// Interface cho dữ liệu nút thích/không thích
interface ReviewInteraction {
	likes: Record<string, boolean>;
	dislikes: Record<string, boolean>;
}

export default function HomeReviews() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);
	const [interactions, setInteractions] = useState<ReviewInteraction>({
		likes: {},
		dislikes: {},
	});

	// Tải thông tin like/dislike từ localStorage
	useEffect(() => {
		const savedInteractions = localStorage.getItem('reviewInteractions');
		if (savedInteractions) {
			try {
				const parsed = JSON.parse(savedInteractions) as ReviewInteraction;
				setInteractions(parsed);
			} catch (error) {
				console.error('Lỗi khi phân tích dữ liệu tương tác:', error);
				// Khởi tạo mới nếu có lỗi
				setInteractions({ likes: {}, dislikes: {} });
			}
		}
	}, []);

	// Lưu thông tin like/dislike vào localStorage khi thay đổi
	useEffect(() => {
		localStorage.setItem('reviewInteractions', JSON.stringify(interactions));
	}, [interactions]);

	useEffect(() => {
		const loadApprovedReviews = async () => {
			setLoading(true);
			try {
				const response = await ReviewService.getReviews({ status: 'approved' });
				if (response?.data && Array.isArray(response.data.reviews)) {
					setReviews(response.data.reviews);
				}
			} catch (error) {
				console.error('Error loading approved reviews:', error);
			}
			setLoading(false);
		};

		loadApprovedReviews();
	}, []);

	// Xử lý khi nhấn nút Like
	const handleLike = (reviewId: string) => {
		setInteractions((prev) => {
			const newInteractions = { ...prev };

			// Nếu đã like trước đó, bỏ like
			if (newInteractions.likes[reviewId]) {
				delete newInteractions.likes[reviewId];
				message.info('Đã bỏ thích bài viết');
			}
			// Nếu chưa like, thêm like và xóa dislike nếu có
			else {
				newInteractions.likes[reviewId] = true;
				if (newInteractions.dislikes[reviewId]) {
					delete newInteractions.dislikes[reviewId];
				}
				message.success('Đã thích bài viết');
			}

			return newInteractions;
		});
	};

	// Xử lý khi nhấn nút Dislike
	const handleDislike = (reviewId: string) => {
		setInteractions((prev) => {
			const newInteractions = { ...prev };

			// Nếu đã dislike trước đó, bỏ dislike
			if (newInteractions.dislikes[reviewId]) {
				delete newInteractions.dislikes[reviewId];
				message.info('Đã bỏ không thích bài viết');
			}
			// Nếu chưa dislike, thêm dislike và xóa like nếu có
			else {
				newInteractions.dislikes[reviewId] = true;
				if (newInteractions.likes[reviewId]) {
					delete newInteractions.likes[reviewId];
				}
				message.success('Đã đánh dấu không thích bài viết');
			}

			return newInteractions;
		});
	};
	// Đếm số lượng like cho một review
	const getLikeCount = (reviewId: string) => {
		// Mặc định mỗi review có 0 like
		let baseCount = 0;

		// Nếu người dùng đã like, tăng thêm 1
		if (interactions.likes[reviewId]) {
			baseCount += 1;
		}

		return baseCount;
	};

	// Đếm số lượng dislike cho một review
	const getDislikeCount = (reviewId: string) => {
		// Mặc định mỗi review có 0 dislike
		let baseCount = 0;

		// Nếu người dùng đã dislike, tăng thêm 1
		if (interactions.dislikes[reviewId]) {
			baseCount += 1;
		}

		return baseCount;
	};

	if (loading) {
		return <div>Đang tải bài viết...</div>;
	}

	return (
		<div>
			{reviews.map((review) => (
				<Card
					key={review._id}
					style={{
						marginBottom: 16,
						backgroundColor: '#f8f9fa',
						borderRadius: 8,
						border: 'none',
					}}
					bodyStyle={{ padding: 16 }}
				>
					{/* Header */}
					<div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
						<Avatar
							size={48}
							style={{ marginRight: 12, backgroundColor: '#87d068' }}
							// src={review.author_id?.profile?.avatar_url}
						>
							{review.author_id?.profile?.username?.charAt(0)?.toUpperCase()}
						</Avatar>
						<div style={{ flex: 1 }}>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<div>
									<Text strong style={{ fontSize: 16, marginRight: 8 }}>
										{review.author_id?.profile?.username || 'Ẩn danh'}
									</Text>
									<Text type='secondary'>Người mới</Text>
								</div>
								<Space>
									<Button type='primary' style={{ borderRadius: 16 }}>
										Follow
									</Button>
									<Button
										type='default'
										style={{
											borderRadius: 16,
											backgroundColor: '#e6f4ff',
											color: '#1677ff',
											border: 'none',
										}}
									>
										{review.game_id?.title || 'Game không xác định'}
									</Button>
								</Space>
							</div>
						</div>
					</div>

					{/* Content */}
					<div style={{ marginBottom: 16 }}>
						<Paragraph style={{ margin: 0 }}>{removeHtmlTags(review.content)}</Paragraph>
					</div>

					{/* Images */}
					{review.images && review.images.length > 0 && (
						<div
							style={{
								marginBottom: 16,
								display: 'flex',
								justifyContent: 'center',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							<Image.PreviewGroup>
								<Space size={8} direction='vertical' align='center'>
									{review.images.map((url) => (
										<Image
											key={`review-image-${url}-${Date.now()}`}
											src={url}
											alt='review image'
											style={{
												maxWidth: '100%',
												maxHeight: 400,
												objectFit: 'contain',
												borderRadius: 8,
											}}
										/>
									))}
								</Space>
							</Image.PreviewGroup>
						</div>
					)}

					{/* Footer */}
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							background: '#f0f2f5',
							padding: '8px 16px',
							borderRadius: 8,
							marginTop: 12,
						}}
					>
						<Space size={24}>
							<Space split={<span style={{ margin: '0 8px' }}>|</span>}>
								<Button type='text' onClick={() => handleLike(review._id)}>
									<Space>
										{interactions.likes[review._id] ? <LikeFilled style={{ color: '#1677ff' }} /> : <LikeOutlined />}
										{getLikeCount(review._id)}
									</Space>
								</Button>
								<Button type='text' onClick={() => handleDislike(review._id)}>
									<Space>
										{interactions.dislikes[review._id] ? (
											<DislikeFilled style={{ color: '#ff4d4f' }} />
										) : (
											<DislikeOutlined />
										)}
										{getDislikeCount(review._id)}
									</Space>
								</Button>
								<Button type='text'>
									<Space>
										<CommentOutlined /> 11
									</Space>
								</Button>
								<Button type='text'>
									<ShareAltOutlined />
								</Button>
							</Space>
						</Space>
						<Space>
							<Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
							<Text strong>{review.rating}/5 ⭐</Text>
						</Space>
					</div>
				</Card>
			))}
		</div>
	);
}
