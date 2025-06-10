import { useEffect, useState } from 'react';
import { ReviewService } from '@/services';
import type { Review } from '@/services/ReviewServices';
import { Card, Rate, Avatar, Typography, Image, Space, Button, message, Empty } from 'antd';
import {
	LikeOutlined,
	DislikeOutlined,
	CommentOutlined,
	ShareAltOutlined,
	LikeFilled,
	DislikeFilled,
} from '@ant-design/icons';
import { useModel } from 'umi';

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

// Interface cho dữ liệu người dùng
interface UserData {
	_id: string;
	email: string;
	profile: {
		username: string;
	};
	[key: string]: any;
}

export default function FollowingPosts() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);
	const [interactions, setInteractions] = useState<ReviewInteraction>({
		likes: {},
		dislikes: {},
	});
	const [currentUser, setCurrentUser] = useState<UserData | null>(null);
	const [allUserInteractions, setAllUserInteractions] = useState<Record<string, ReviewInteraction>>({}); // Sử dụng follow model
	const { followingList, getFollowingList, unfollowUser, refreshFollowData, clearFollowData, currentUserId } =
		useModel('follow'); // Lấy thông tin người dùng hiện tại
	useEffect(() => {
		const userString = localStorage.getItem('user');
		if (userString) {
			try {
				const user = JSON.parse(userString);
				setCurrentUser(user);
			} catch (error) {
				console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
			}
		}
	}, []);
	// Refresh follow data when current user changes
	useEffect(() => {
		if (currentUser?._id && currentUserId !== currentUser._id) {
			refreshFollowData();
		} else if (!currentUser?._id && currentUserId) {
			// User logged out
			clearFollowData();
		}
	}, [currentUser?._id, currentUserId, refreshFollowData, clearFollowData]);

	// Tải lại danh sách following khi user thay đổi
	useEffect(() => {
		if (currentUser?._id) {
			getFollowingList();
		}
	}, [currentUser?._id, getFollowingList]);

	// Tải tất cả tương tác của tất cả người dùng từ localStorage
	useEffect(() => {
		const allInteractions: Record<string, ReviewInteraction> = {};

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('reviewInteractions_')) {
				try {
					const userId = key.replace('reviewInteractions_', '');
					const data = localStorage.getItem(key);
					if (data) {
						allInteractions[userId] = JSON.parse(data) as ReviewInteraction;
					}
				} catch (error) {
					console.error('Lỗi khi phân tích dữ liệu:', error);
				}
			}
		}

		setAllUserInteractions(allInteractions);
	}, []);

	// Tải thông tin like/dislike của người dùng hiện tại từ localStorage
	useEffect(() => {
		if (!currentUser?._id) return;

		const userInteractionKey = `reviewInteractions_${currentUser._id}`;
		const savedInteractions = localStorage.getItem(userInteractionKey);

		if (savedInteractions) {
			try {
				const parsed = JSON.parse(savedInteractions) as ReviewInteraction;
				setInteractions(parsed);

				setAllUserInteractions((prev) => ({
					...prev,
					[currentUser._id]: parsed,
				}));
			} catch (error) {
				console.error('Lỗi khi phân tích dữ liệu tương tác:', error);
				setInteractions({ likes: {}, dislikes: {} });
			}
		} else {
			setInteractions({ likes: {}, dislikes: {} });
		}
	}, [currentUser]);
	// Lưu thông tin like/dislike vào localStorage khi thay đổi
	useEffect(() => {
		if (!currentUser?._id) return;

		const userInteractionKey = `reviewInteractions_${currentUser._id}`;
		localStorage.setItem(userInteractionKey, JSON.stringify(interactions));

		setAllUserInteractions((prev) => ({
			...prev,
			[currentUser._id]: interactions,
		}));
	}, [interactions, currentUser]);

	// Function to load reviews from followed users
	const loadFollowingReviews = async () => {
		setLoading(true);
		try {
			// Lấy tất cả reviews được approve
			const response = await ReviewService.getReviews({ status: 'approved' });

			if (response.data?.success && response.data?.reviews) {
				// Lọc chỉ những bài viết từ người mà user đang follow
				const followingIds = followingList.map((user: any) => user._id);
				const followingReviews = response.data.reviews.filter((review: Review) =>
					followingIds.includes(review.author_id?._id),
				);

				// Sắp xếp theo thời gian tạo (mới nhất trước tiên)
				const sortedReviews = followingReviews.sort(
					(a: Review, b: Review) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
				);

				setReviews(sortedReviews);
			}
		} catch (error) {
			console.error('Lỗi khi tải bài viết:', error);
			message.error('Không thể tải bài viết');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (followingList.length > 0) {
			loadFollowingReviews();
		} else {
			setReviews([]);
			setLoading(false);
		}
	}, [followingList]);

	// Tính tổng số lượt like cho mỗi review
	const getLikeCount = (reviewId: string) => {
		let count = 0;
		Object.values(allUserInteractions).forEach((userInteraction) => {
			if (userInteraction.likes[reviewId]) {
				count++;
			}
		});
		return count;
	};

	// Tính tổng số lượt dislike cho mỗi review
	const getDislikeCount = (reviewId: string) => {
		let count = 0;
		Object.values(allUserInteractions).forEach((userInteraction) => {
			if (userInteraction.dislikes[reviewId]) {
				count++;
			}
		});
		return count;
	};

	// Xử lý khi nhấn nút Like
	const handleLike = (reviewId: string) => {
		if (!currentUser?._id) {
			message.warning('Vui lòng đăng nhập để thích bài viết');
			return;
		}

		setInteractions((prev) => {
			const newInteractions = { ...prev };

			if (newInteractions.likes[reviewId]) {
				delete newInteractions.likes[reviewId];
				message.info('Đã bỏ thích bài viết');
			} else {
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
		if (!currentUser?._id) {
			message.warning('Vui lòng đăng nhập để không thích bài viết');
			return;
		}

		setInteractions((prev) => {
			const newInteractions = { ...prev };

			if (newInteractions.dislikes[reviewId]) {
				delete newInteractions.dislikes[reviewId];
				message.info('Đã bỏ không thích bài viết');
			} else {
				newInteractions.dislikes[reviewId] = true;
				if (newInteractions.likes[reviewId]) {
					delete newInteractions.likes[reviewId];
				}
				message.success('Đã đánh dấu không thích bài viết');
			}

			return newInteractions;
		});
	};
	// Xử lý khi nhấn nút Unfollow
	const handleUnfollow = async (authorInfo: any) => {
		if (!currentUser?._id) {
			message.warning('Vui lòng đăng nhập');
			return;
		}

		const userId = authorInfo._id;
		const success = await unfollowUser(userId);
		if (success) {
			message.success(`Đã bỏ theo dõi ${authorInfo.profile?.username || 'người dùng này'}`);
			// Refresh following list và reload reviews để cập nhật UI
			await getFollowingList();
			// Reload reviews after unfollowing to remove their posts immediately
			loadFollowingReviews();
		} else {
			message.error('Có lỗi xảy ra khi bỏ theo dõi');
		}
	};

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '40px' }}>
				<Text>Đang tải bài viết...</Text>
			</div>
		);
	}

	if (followingList.length === 0) {
		return (
			<Empty
				description='Bạn chưa theo dõi ai. Hãy quay lại trang chủ để theo dõi những người dùng khác!'
				style={{ marginTop: '40px' }}
			/>
		);
	}

	if (reviews.length === 0) {
		return <Empty description='Những người bạn theo dõi chưa có bài viết nào' style={{ marginTop: '40px' }} />;
	}

	return (
		<div style={{ maxWidth: '800px', margin: '0 auto' }}>
			{reviews.map((review) => (
				<Card key={review._id} style={{ marginBottom: 24, borderRadius: 12 }}>
					{/* Header */}
					<div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
						<Avatar size={48} style={{ marginRight: 12, backgroundColor: '#87d068' }}>
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
									<Button danger style={{ borderRadius: 16 }} onClick={() => handleUnfollow(review.author_id)}>
										Bỏ theo dõi
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
