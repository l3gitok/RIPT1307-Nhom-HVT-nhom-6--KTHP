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

// Interface cho dữ liệu người dùng
interface UserData {
	_id: string;
	email: string;
	profile: {
		username: string;
	};
	[key: string]: any;
}

export default function HomeReviews() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);
	const [interactions, setInteractions] = useState<ReviewInteraction>({
		likes: {},
		dislikes: {},
	});
	const [currentUser, setCurrentUser] = useState<UserData | null>(null);
	// Lưu trữ tất cả tương tác từ tất cả người dùng
	const [allUserInteractions, setAllUserInteractions] = useState<{
		[userId: string]: ReviewInteraction;
	}>({});

	// Lấy thông tin người dùng hiện tại
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

	// Tải tất cả tương tác của tất cả người dùng từ localStorage
	useEffect(() => {
		// Lấy danh sách tất cả các key trong localStorage
		const allInteractions: { [userId: string]: ReviewInteraction } = {};

		// Quét toàn bộ localStorage để tìm các key bắt đầu bằng 'reviewInteractions_'
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

				// Cập nhật tương tác của người dùng hiện tại vào tất cả tương tác
				setAllUserInteractions((prev) => ({
					...prev,
					[currentUser._id]: parsed,
				}));
			} catch (error) {
				console.error('Lỗi khi phân tích dữ liệu tương tác:', error);
				// Khởi tạo mới nếu có lỗi
				setInteractions({ likes: {}, dislikes: {} });
			}
		} else {
			// Reset tương tác khi đổi tài khoản
			setInteractions({ likes: {}, dislikes: {} });
		}
	}, [currentUser]);
	// Lưu thông tin like/dislike vào localStorage khi thay đổi
	useEffect(() => {
		if (!currentUser?._id) return;

		const userInteractionKey = `reviewInteractions_${currentUser._id}`;
		localStorage.setItem(userInteractionKey, JSON.stringify(interactions));

		// Cập nhật vào tổng thể tương tác
		setAllUserInteractions((prev) => ({
			...prev,
			[currentUser._id]: interactions,
		}));
	}, [interactions, currentUser]);

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
		// Kiểm tra đăng nhập
		if (!currentUser?._id) {
			message.warning('Vui lòng đăng nhập để thích bài viết');
			return;
		}

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
		// Kiểm tra đăng nhập
		if (!currentUser?._id) {
			message.warning('Vui lòng đăng nhập để không thích bài viết');
			return;
		}

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
	}; // Đếm số lượng like cho một review từ tất cả người dùng
	const getLikeCount = (reviewId: string) => {
		let totalCount = 0;

		// Đếm tổng số like từ tất cả người dùng
		Object.values(allUserInteractions).forEach((userInteraction) => {
			if (userInteraction.likes && userInteraction.likes[reviewId]) {
				totalCount += 1;
			}
		});

		return totalCount;
	};

	// Đếm số lượng dislike cho một review từ tất cả người dùng
	const getDislikeCount = (reviewId: string) => {
		let totalCount = 0;

		// Đếm tổng số dislike từ tất cả người dùng
		Object.values(allUserInteractions).forEach((userInteraction) => {
			if (userInteraction.dislikes && userInteraction.dislikes[reviewId]) {
				totalCount += 1;
			}
		});

		return totalCount;
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
