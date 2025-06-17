import React from 'react';
import { Card, Avatar, Space, Rate, Button, Tag, Typography, Modal, List } from 'antd';
import {
	UserOutlined,
	ClockCircleOutlined,
	CheckCircleFilled,
	LikeOutlined,
	CommentOutlined,
	CameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useHistory } from 'umi';
import CommentSection from '../../pages/UserProfile/components/CommentSection';
import { getGameDisplayInfo, getAuthorInfo } from '../../services/HomePageServices';
import type { ReviewItemProps } from '../../services/HomePageServices';

const { Text } = Typography;

const ReviewItem: React.FC<ReviewItemProps> = ({
	review,
	games,
	currentUser,
	reviewLikes,
	reviewLikeCounts,
	likingReview,
	onToggleLike,
	onCommentsCountChange,
}) => {
	const history = useHistory();
	const { author, authorName, authorId } = getAuthorInfo(review);
	const { gameName, isNewGame } = getGameDisplayInfo(review, games);

	const navigateToProfile = (userId: string) => {
		history.push(`/profile/${userId}`);
	};

	return (
		<List.Item key={review._id} style={{ padding: 0, border: 'none' }}>
			<Card
				style={{
					width: '100%',
					marginBottom: 16,
					borderRadius: 12,
					boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
				}}
			>
				{/* Post Header */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
					<Space style={{ cursor: 'pointer' }} onClick={() => authorId && navigateToProfile(authorId)}>
						<Avatar src={author?.profile?.avatar_url} icon={<UserOutlined />} size={40} />
						<div>
							<Text strong style={{ display: 'block' }}>
								{authorName}
								{author?.is_verified && <CheckCircleFilled style={{ color: '#1890ff', marginLeft: 4 }} />}
							</Text>
							<Text type='secondary' style={{ fontSize: '12px' }}>
								<ClockCircleOutlined style={{ marginRight: 4 }} />
								{dayjs(review.created_at).format('DD/MM/YYYY HH:mm')}
							</Text>
						</div>
					</Space>

					<div style={{ textAlign: 'right' }}>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
							<Text strong style={{ color: '#1890ff' }}>
								<CameraOutlined style={{ marginRight: 4 }} />
								{gameName}
							</Text>
							{isNewGame && (
								<Tag color='orange' style={{ fontSize: '10px', margin: 0 }}>
									Mới
								</Tag>
							)}
						</div>
						<Rate disabled value={review.rating} style={{ fontSize: 14 }} />
					</div>
				</div>

				{/* Content & Images */}
				<div style={{ marginBottom: 16 }}>
					<Text style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: 12, wordBreak: 'break-word' }}>
						{review.content}
					</Text>

					{review.images && review.images.length > 0 && (
						<div style={{ marginBottom: 12 }}>
							{' '}
							<Space wrap size='small'>
								{review.images.slice(0, 4).map((imageUrl) => (
									<img
										key={imageUrl}
										src={imageUrl}
										alt='Review image'
										style={{
											width: 120,
											height: 120,
											objectFit: 'cover',
											borderRadius: 8,
											border: '1px solid #f0f0f0',
											cursor: 'pointer',
										}}
										onClick={() => {
											Modal.info({
												title: 'Xem ảnh',
												content: <img src={imageUrl} style={{ width: '100%' }} alt='Full size' />,
												width: 600,
											});
										}}
									/>
								))}
								{review.images.length > 4 && (
									<div
										style={{
											width: 120,
											height: 120,
											backgroundColor: '#f5f5f5',
											borderRadius: 8,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '14px',
											color: '#666',
											border: '1px solid #f0f0f0',
										}}
									>
										+{review.images.length - 4}
									</div>
								)}
							</Space>
						</div>
					)}
				</div>

				{/* Footer */}
				<div
					style={{
						borderTop: '1px solid #f0f0f0',
						paddingTop: 12,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Space size='large'>
						<Button
							type='text'
							size='small'
							loading={likingReview[review._id]}
							onClick={() => onToggleLike(review._id)}
							disabled={!currentUser}
							style={{
								padding: '4px 8px',
								height: 'auto',
								color: reviewLikes[review._id] ? '#ff4d4f' : '#8c8c8c',
							}}
						>
							<Space size={4}>
								<LikeOutlined style={{ color: reviewLikes[review._id] ? '#ff4d4f' : '#8c8c8c' }} />
								<span>{reviewLikeCounts[review._id] || 0}</span>
							</Space>
						</Button>

						<Text type='secondary' style={{ fontSize: '12px' }}>
							<CommentOutlined style={{ marginRight: 4 }} />
							{review.replies_count || 0} bình luận
						</Text>
					</Space>
				</div>

				{/* Comment Section */}
				<CommentSection
					reviewId={review._id}
					currentUser={currentUser}
					commentsCount={review.replies_count || 0}
					onCommentsCountChange={(count) => onCommentsCountChange(review._id, count)}
				/>
			</Card>
		</List.Item>
	);
};

export default ReviewItem;
