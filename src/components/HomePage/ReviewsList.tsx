import React from 'react';
import { List, Spin, Empty, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ReviewItem from './ReviewItem';
import type { Review } from '../../services/ReviewServices';
import type { Game } from '../../services/GameServices';
import type { User } from '../../services/UserServices';

const { Title, Text } = Typography;

interface ReviewsListProps {
	reviews: Review[];
	games: Game[];
	currentUser: User | null;
	reviewsLoading: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
	reviewLikes: Record<string, boolean>;
	reviewLikeCounts: Record<string, number>;
	likingReview: Record<string, boolean>;
	onToggleLike: (reviewId: string) => void;
	onLoadMore: () => void;
	onCommentsCountChange: (reviewId: string, count: number) => void;
	onOpenModal: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
	reviews,
	games,
	currentUser,
	reviewsLoading,
	pagination,
	reviewLikes,
	reviewLikeCounts,
	likingReview,
	onToggleLike,
	onLoadMore,
	onCommentsCountChange,
	onOpenModal,
}) => {
	return (
		<div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px' }}>
			<div
				style={{
					marginBottom: '24px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Title level={4} style={{ margin: 0, color: '#333' }}>
					🎮 Reviews mới nhất
				</Title>
				<Text type='secondary' style={{ fontSize: '12px' }}>
					{pagination.total} bài viết
				</Text>
			</div>

			<Spin spinning={reviewsLoading && reviews.length === 0}>
				<List
					dataSource={reviews}
					renderItem={(review) => (
						<ReviewItem
							key={review._id}
							review={review}
							games={games}
							currentUser={currentUser}
							reviewLikes={reviewLikes}
							reviewLikeCounts={reviewLikeCounts}
							likingReview={likingReview}
							onToggleLike={onToggleLike}
							onCommentsCountChange={onCommentsCountChange}
						/>
					)}
					locale={{
						emptyText: (
							<div style={{ textAlign: 'center', padding: '60px 20px' }}>
								<Empty
									description={
										<div>
											<Text type='secondary' style={{ fontSize: '16px' }}>
												Chưa có bài review nào
											</Text>
											<br />
											<Text type='secondary' style={{ fontSize: '14px' }}>
												Hãy là người đầu tiên chia sẻ review game!
											</Text>
										</div>
									}
									image={Empty.PRESENTED_IMAGE_SIMPLE}
								/>
								{currentUser && (
									<Button
										type='primary'
										size='large'
										icon={<PlusOutlined />}
										onClick={onOpenModal}
										style={{ marginTop: '16px' }}
									>
										Viết review đầu tiên
									</Button>
								)}
							</div>
						),
					}}
				/>
			</Spin>

			{/* Load More Button */}
			{reviews.length < pagination.total && (
				<div style={{ textAlign: 'center', marginTop: 32, marginBottom: 32 }}>
					<Button
						size='large'
						loading={reviewsLoading}
						onClick={onLoadMore}
						style={{
							borderRadius: 20,
							paddingLeft: 32,
							paddingRight: 32,
							height: 44,
						}}
					>
						{reviewsLoading ? 'Đang tải...' : 'Xem thêm bài viết'}
					</Button>
				</div>
			)}
		</div>
	);
};

export default ReviewsList;
