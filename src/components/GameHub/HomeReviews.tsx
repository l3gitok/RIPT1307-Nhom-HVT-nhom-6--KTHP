import { useEffect, useState } from 'react';
import { ReviewService } from '@/services';
import type { Review } from '@/services/ReviewServices';
import { Card, Rate, Avatar, Typography, Image, Space, Button } from 'antd';
import { LikeOutlined, DislikeOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export default function HomeReviews() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);

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
						<Paragraph style={{ margin: 0 }}>{review.content}</Paragraph>
					</div>

					{/* Images */}
					{review.images && review.images.length > 0 && (
						<div style={{ marginBottom: 16 }}>
							<Image.PreviewGroup>
								<Space size={8} wrap>
									{review.images.map((url) => (
										<Image
											key={url}
											src={url}
											alt='review image'
											style={{
												width: '100%',
												height: 400,
												objectFit: 'cover',
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
								<Button type='text'>
									<Space>
										<LikeOutlined /> 10
									</Space>
								</Button>
								<Button type='text'>
									<Space>
										<DislikeOutlined /> 10
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
