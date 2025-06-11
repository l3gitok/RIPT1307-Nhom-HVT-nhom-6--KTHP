import React, { useState, useEffect } from 'react';
import { 
    List, 
    Card, 
    Avatar, 
    Space, 
    Typography, 
    Rate, 
    Button, 
    Empty, 
    Spin, 
    message, 
    Modal,
    Tag
} from 'antd';
import { 
    UserOutlined, 
    ClockCircleOutlined, 
    CheckCircleFilled,
    LikeOutlined,
    CommentOutlined,
    CameraOutlined  // ✅ Đổi lại thành CameraOutlined vì GamepadOutlined không tồn tại
} from '@ant-design/icons';
import { history } from 'umi';
import axios from 'axios';
import dayjs from 'dayjs';
import CommentSection from '../../UserProfile/components/CommentSection';
import { toggleReviewLike } from '../../../models/comment';
import { fetchReviews } from '../../../models/review';
import useUserModel from '../../../models/user'; // ✅ Import useUserModel như UserProfile
import type { Review } from '../../../services/ReviewServices';
import type { User } from '../../../services/UserServices';

const { Text, Paragraph } = Typography;
const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

interface FollowingPostsProps {}

const FollowingPosts: React.FC<FollowingPostsProps> = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [loadingMore, setLoadingMore] = useState(false);
    
    // ✅ Sử dụng useUserModel như UserProfile
    const {
        followingData,
        getFollowing,
    } = useUserModel();
    
    // Like states
    const [reviewLikes, setReviewLikes] = useState<{[key: string]: boolean}>({});
    const [reviewLikeCounts, setReviewLikeCounts] = useState<{[key: string]: number}>({});
    const [likingReview, setLikingReview] = useState<{[key: string]: boolean}>({});

    // ✅ Get current user - giống UserProfile
    useEffect(() => {
        const getCurrentUser = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.success) {
                        setCurrentUser(res.data.user);
                    }
                } catch (error: any) {
                    console.error('Error fetching current user:', error);
                    if (error.response?.status === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        message.warning('Phiên đăng nhập đã hết hạn');
                        history.push('/user/login');
                    }
                }
            } else {
                message.warning('Vui lòng đăng nhập để xem bài viết từ người bạn theo dõi');
                history.push('/user/login');
            }
        };
        getCurrentUser();
    }, []);

    // ✅ Get following users khi có currentUser - giống UserProfile
    useEffect(() => {
        if (currentUser?._id) {
            const loadFollowingData = async () => {
                try {
                    console.log('Loading following data for user:', currentUser._id);
                    await getFollowing(currentUser._id);
                } catch (error) {
                    console.error('Error loading following data:', error);
                    message.error('Không thể tải danh sách người theo dõi');
                }
            };
            
            loadFollowingData();
        }
    }, [currentUser?._id]);

    // ✅ Load reviews when followingData changes
    useEffect(() => {
        if (currentUser && followingData) {
            loadFollowingReviews();
        }
    }, [currentUser, followingData]);

    // ✅ Load reviews from following users - sử dụng followingData từ model
    const loadFollowingReviews = async (page = 1, append = false) => {
        if (!currentUser || !followingData || followingData.length === 0) {
            setReviews([]);
            setLoading(false);
            return;
        }

        setLoading(!append);
        setLoadingMore(append);

        try {
            // ✅ Extract following user IDs từ followingData - giống cách UserProfile xử lý
            const followingIds = followingData
                .filter(item => item?._id) // Lọc bỏ null/undefined
                .map(item => item._id);
            
            console.log('Following user IDs:', followingIds);
            
            // ✅ Sử dụng fetchReviews từ model giống như UserProfile
            const { reviews: allReviews } = await fetchReviews({ 
                limit: 100,
                status: 'approved' // Chỉ lấy bài đã duyệt
            });

            // ✅ Filter reviews từ những người đang theo dõi
            const followingReviews = allReviews.filter(review => {
                let reviewUserId: string | undefined;
                
                if (typeof review.author_id === 'string') {
                    reviewUserId = review.author_id;
                } else if (review.author_id && typeof review.author_id._id === 'string') {
                    reviewUserId = review.author_id._id;
                }
                
                return reviewUserId && followingIds.includes(reviewUserId);
            });

            // ✅ Sort by created_at descending (newest first)
            const sortedReviews = followingReviews.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // ✅ Pagination logic
            const startIndex = (page - 1) * pagination.limit;
            const endIndex = startIndex + pagination.limit;
            const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

            if (append) {
                setReviews(prev => [...prev, ...paginatedReviews]);
            } else {
                setReviews(paginatedReviews);
            }

            setPagination(prev => ({
                ...prev,
                page,
                total: sortedReviews.length
            }));

            console.log(`Loaded ${paginatedReviews.length} reviews from ${followingIds.length} following users`);

        } catch (error: any) {
            console.error('Error loading following reviews:', error);
            message.error('Không thể tải bài viết từ người bạn theo dõi');
            setReviews([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // ✅ Load like status - giống UserProfile
    useEffect(() => {
        if (currentUser && reviews.length > 0) {
            const initialLikeCounts: {[key: string]: number} = {};
            const initialLikeStatus: {[key: string]: boolean} = {};
            
            reviews.forEach(review => {
                initialLikeCounts[review._id] = review.likes_count || 
                    (Array.isArray(review.likes) ? review.likes.length : 0);
                
                if (Array.isArray(review.likes)) {
                    initialLikeStatus[review._id] = review.likes.some((like: any) => {
                        const likeUserId = typeof like.user_id === 'string' 
                            ? like.user_id 
                            : like.user_id?._id;
                        return likeUserId?.toString() === currentUser._id?.toString();
                    });
                } else {
                    initialLikeStatus[review._id] = false;
                }
            });
            
            setReviewLikeCounts(initialLikeCounts);
            setReviewLikes(initialLikeStatus);
        }
    }, [currentUser, reviews]);

    // ✅ Handle like/unlike - giống UserProfile
    const handleToggleReviewLike = async (reviewId: string) => {
        if (!currentUser) {
            message.warning('Vui lòng đăng nhập để thích bài viết');
            return;
        }

        const wasLiked = reviewLikes[reviewId] || false;
        setLikingReview(prev => ({ ...prev, [reviewId]: true }));
        
        try {
            const result = await toggleReviewLike(reviewId);
            setReviewLikes(prev => ({ ...prev, [reviewId]: result.liked }));
            setReviewLikeCounts(prev => ({ ...prev, [reviewId]: result.likesCount }));
            
            if (!wasLiked && result.liked) {
                message.success('Đã thích bài viết');
            } else if (wasLiked && !result.liked) {
                message.success('Đã bỏ thích bài viết');
            }
            
        } catch (error: any) {
            console.error('Error toggling review like:', error);
            message.error(error.message || 'Không thể thích/bỏ thích bài viết');
        } finally {
            setLikingReview(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    // ✅ Handle comments count change
    const handleCommentsCountChange = (reviewId: string, count: number) => {
        setReviews(prev => prev.map(review => 
            review._id === reviewId 
                ? { ...review, replies_count: count }
                : review
        ));
    };

    // ✅ Load more reviews
    const handleLoadMore = () => {
        if (reviews.length < pagination.total) {
            loadFollowingReviews(pagination.page + 1, true);
        }
    };

    // ✅ Navigate to profile
    const navigateToProfile = (userId: string) => {
        history.push(`/profile/${userId}`);
    };

    // ✅ Render review item - giống UserProfile nhưng có tag "Đang theo dõi"
    const renderReviewItem = (review: Review) => {
        const author = typeof review.author_id === 'object' && review.author_id !== null 
            ? review.author_id 
            : null;
        
        const authorName = author?.profile?.username || author?.email?.split('@')[0] || 'Unknown User';
        const authorId = typeof review.author_id === 'string' ? review.author_id : author?._id;
        
        // Enhanced game name handling
        let gameName = 'Unknown Game';
        let isNewGame = false;
        
        if (typeof review.game_id === 'object' && review.game_id !== null && 'title' in review.game_id) {
            gameName = review.game_id.title;
        } else if (typeof review.game_id === 'string') {
            gameName = review.game_title || review.game_id;
            if (review.game_title && review.game_title !== review.game_id) {
                isNewGame = true;
            }
        }

        return (
            <List.Item key={review._id} style={{ padding: 0, border: 'none' }}>
                <Card 
                    style={{ 
                        width: '100%', 
                        marginBottom: 16,
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                >
                    {/* ✅ Post Header */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 16
                    }}>
                        <Space 
                            style={{ cursor: 'pointer' }}
                            onClick={() => authorId && navigateToProfile(authorId)}
                        >
                            <Avatar
                                src={author?.profile?.avatar_url}
                                icon={<UserOutlined />}
                                size={40}
                            />
                            <div>
                                <Text strong style={{ display: 'block' }}>
                                    {authorName}
                                    {author?.is_verified && (
                                        <CheckCircleFilled 
                                            style={{ color: '#1890ff', marginLeft: 4 }} 
                                        />
                                    )}
                                    <Tag color="blue" style={{ marginLeft: 8, fontSize: '10px' }}>
                                        Đang theo dõi
                                    </Tag>
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    {dayjs(review.created_at).format('DD/MM/YYYY HH:mm')}
                                </Text>
                            </div>
                        </Space>
                        
                        {/* ✅ Game Info & Rating */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                <Text strong style={{ color: '#1890ff' }}>
                                    <CameraOutlined style={{ marginRight: 4 }} />  {/* ✅ Đổi lại thành CameraOutlined */}
                                    {gameName}
                                </Text>
                                {isNewGame && (
                                    <Tag color="orange" style={{ fontSize: '10px', margin: 0 }}>
                                        Mới
                                    </Tag>
                                )}
                            </div>
                            <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                        </div>
                    </div>

                    {/* ✅ Post Content */}
                    <div style={{ marginBottom: 16 }}>
                        <Paragraph 
                            style={{ 
                                fontSize: '15px', 
                                lineHeight: '1.6',
                                marginBottom: 12,
                                wordBreak: 'break-word'
                            }}
                        >
                            {review.content}
                        </Paragraph>

                        {/* ✅ Post Images */}
                        {review.images && review.images.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <Space wrap size="small">
                                    {review.images.slice(0, 4).map((imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`Review image ${index + 1}`}
                                            style={{
                                                width: 120,
                                                height: 120,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                                border: '1px solid #f0f0f0',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                Modal.info({
                                                    title: 'Xem ảnh',
                                                    content: <img src={imageUrl} style={{ width: '100%' }} />,
                                                    width: 600
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
                                                border: '1px solid #f0f0f0'
                                            }}
                                        >
                                            +{review.images.length - 4}
                                        </div>
                                    )}
                                </Space>
                            </div>
                        )}
                    </div>

                    {/* ✅ Post Footer */}
                    <div style={{ 
                        borderTop: '1px solid #f0f0f0', 
                        paddingTop: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Space size="large">
                            <Button
                                type="text"
                                size="small"
                                loading={likingReview[review._id]}
                                onClick={() => handleToggleReviewLike(review._id)}
                                disabled={!currentUser}
                                style={{ 
                                    padding: '4px 8px',
                                    height: 'auto',
                                    color: reviewLikes[review._id] ? '#ff4d4f' : '#8c8c8c'
                                }}
                            >
                                <Space size={4}>
                                    <LikeOutlined style={{ 
                                        color: reviewLikes[review._id] ? '#ff4d4f' : '#8c8c8c'
                                    }} />
                                    <span>{reviewLikeCounts[review._id] || 0}</span>
                                </Space>
                            </Button>
                            
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                <CommentOutlined style={{ marginRight: 4 }} />
                                {review.replies_count || 0} bình luận
                            </Text>
                        </Space>
                    </div>

                    {/* ✅ Comment Section */}
                    <CommentSection
                        reviewId={review._id}
                        currentUser={currentUser}
                        commentsCount={review.replies_count || 0}
                        onCommentsCountChange={(count) => handleCommentsCountChange(review._id, count)}
                    />
                </Card>
            </List.Item>
        );
    };

    if (!currentUser) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                    <Text>Đang kiểm tra thông tin đăng nhập...</Text>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Spin spinning={loading}>
                <List
                    dataSource={reviews}
                    renderItem={renderReviewItem}
                    locale={{ 
                        emptyText: (
                            <Empty 
                                description={
                                    <div>
                                        <Text type="secondary">
                                            {(!followingData || followingData.length === 0)
                                                ? "Bạn chưa theo dõi ai. Hãy theo dõi một số người để xem bài viết của họ!"
                                                : "Chưa có bài viết từ người bạn theo dõi"
                                            }
                                        </Text>
                                        <br />
                                        <Button 
                                            type="link" 
                                            onClick={() => history.push('/discover')}
                                            style={{ padding: 0, marginTop: 8 }}
                                        >
                                            Khám phá và theo dõi thêm người dùng →
                                        </Button>
                                    </div>
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }}
                />
            </Spin>
            
            {/* ✅ Load More Button */}
            {reviews.length > 0 && reviews.length < pagination.total && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Button 
                        size="large"
                        loading={loadingMore}
                        onClick={handleLoadMore}
                    >
                        Xem thêm bài viết ({pagination.total - reviews.length} còn lại)
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FollowingPosts;