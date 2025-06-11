import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Col, 
  Row, 
  Typography, 
  Layout, 
  Input, 
  Dropdown, 
  Menu, 
  Modal, 
  List, 
  Upload, 
  message, 
  Card,
  Avatar,
  Space,
  Rate,
  Tag,
  Spin,
  Empty,
  Select,
  Form,
  Progress
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  StarOutlined, 
  CheckCircleFilled,
  LikeOutlined,
  CommentOutlined,
  PlusOutlined,
  CameraOutlined,
  LoadingOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { history } from 'umi';
import axios from 'axios';
import dayjs from 'dayjs';
import GameHubHeader from '@/components/GameHub/Header';
import Navbar from '@/components/GameHub/Navbar';
import { fetchReviews, createReview } from '../../models/review';
import { toggleReviewLike } from '../../models/comment';
import { fetchGames } from '../../models/game';
import CommentSection from '../UserProfile/components/CommentSection';
import type { Review } from '../../services/ReviewServices';
import type { Game } from '../../services/GameServices';
import type { User } from '../../services/UserServices';

const { Text, Title, Paragraph } = Typography;
const { Header, Content } = Layout;
const { Option } = Select;
const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

const userMenu = (
    <Menu>
        <Menu.Item key='register' onClick={() => history.push('/user/register')}>
            Đăng ký
        </Menu.Item>
        <Menu.Item key='login' onClick={() => history.push('/user/login')}>
            Đăng nhập
        </Menu.Item>
    </Menu>
);

const NAV_ITEMS = [
    { label: 'Đang theo dõi', key: 0 },
    { label: 'Trang chủ', key: 1 },
    { label: 'Bảng Xếp Hạng', key: 2 },
];

const TrangChu = (): JSX.Element => {
    const [searchText, setSearchText] = useState('');
    const [activeNav, setActiveNav] = useState(1);
    const [postModalOpen, setPostModalOpen] = useState(false);
    
    // ✅ Add useEffect to handle navigation highlighting based on current route
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath === '/home' || currentPath === '/') {
            setActiveNav(1); // Trang chủ
        } else if (currentPath === '/dang-theo-doi') {
            setActiveNav(0); // Đang theo dõi
        } else if (currentPath === '/bang-xep-hang') {
            setActiveNav(2); // Bảng Xếp Hạng
        }
    }, []);

    // ✅ Add navigation handler
    const handleNavChange = (navKey: number) => {
        setActiveNav(navKey);
        
        // Navigate to corresponding route
        switch (navKey) {
            case 0:
                history.push('/dang-theo-doi');
                break;
            case 1:
                history.push('/home');
                break;
            case 2:
                history.push('/bang-xep-hang');
                break;
            default:
                break;
        }
    };

    // ✅ Review states
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    
    // ✅ Current user
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // ✅ Like states
    const [reviewLikes, setReviewLikes] = useState<{[key: string]: boolean}>({});
    const [reviewLikeCounts, setReviewLikeCounts] = useState<{[key: string]: number}>({});
    const [likingReview, setLikingReview] = useState<{[key: string]: boolean}>({});
    
    // ✅ Post modal states
    const [form] = Form.useForm();
    const [games, setGames] = useState<Game[]>([]);
    const [postImages, setPostImages] = useState<string[]>([]);
    const [postContent, setPostContent] = useState('');
    const [submittingPost, setSubmittingPost] = useState(false);
    
    // ✅ Upload states - using backend API
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // ✅ Get current user
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
                    }
                }
            }
        };
        getCurrentUser();
    }, []);

    // ✅ Load reviews
    const loadReviews = async (page = 1, append = false) => {
        setReviewsLoading(true);
        try {
            const result = await fetchReviews({
                page,
                limit: pagination.limit,
                status: 'approved'
            });
            
            if (append) {
                setReviews(prev => [...prev, ...result.reviews]);
            } else {
                setReviews(result.reviews);
            }
            
            setPagination(prev => ({
                ...prev,
                page,
                total: result.pagination.total
            }));
            
        } catch (error) {
            console.error('Error loading reviews:', error);
            message.error('Không thể tải bài viết');
        } finally {
            setReviewsLoading(false);
        }
    };

    // ✅ Load games for post modal
    const loadGames = async () => {
        try {
            const result = await fetchGames({ limit: 100 });
            setGames(result.games);
        } catch (error) {
            console.error('Error loading games:', error);
        }
    };

    useEffect(() => {
        loadReviews();
        loadGames();
    }, []);

    // ✅ Load like status
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

    // ✅ Handle like/unlike
    const handleToggleReviewLike = async (reviewId: string) => {
        if (!currentUser) {
            message.warning('Vui lòng đăng nhập để thích bài viết');
            return;
        }

        setLikingReview(prev => ({ ...prev, [reviewId]: true }));
        
        try {
            const result = await toggleReviewLike(reviewId);
            setReviewLikes(prev => ({ ...prev, [reviewId]: result.liked }));
            setReviewLikeCounts(prev => ({ ...prev, [reviewId]: result.likesCount }));
            
        } catch (error: any) {
            console.error('Error toggling review like:', error);
            message.error(error.message || 'Không thể thích/bỏ thích bài viết');
        } finally {
            setLikingReview(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    // ✅ Upload image through backend API
    const onUploadImage = async (file: File): Promise<string | null> => {
        // Validate file
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được upload file ảnh (JPG, PNG, JPEG)');
            return null;
        }

        const isValidSize = file.size / 1024 / 1024 < 5;
        if (!isValidSize) {
            message.error('Ảnh phải nhỏ hơn 5MB');
            return null;
        }

        setUploadLoading(true);
        setUploadProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        const formData = new FormData();
        formData.append('image', file); // ✅ Backend expects 'image' field

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Phiên đăng nhập hết hạn - vui lòng đăng nhập lại');
            }

            const response = await axios.post(
                `${API_BASE_URL}/upload/image`, // ✅ Use backend upload endpoint
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}` // ✅ Required by backend
                    },
                    timeout: 30000,
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(Math.min(progress, 90));
                        }
                    }
                }
            );

            if (response.data && response.data.success && response.data.data?.url) {
                setUploadProgress(100);
                setTimeout(() => setUploadProgress(0), 1000);
                return response.data.data.url; // ✅ Backend returns { success: true, data: { url, public_id } }
            } else {
                throw new Error('Upload failed - no URL returned');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadProgress(0);
            
            // ✅ Handle backend-specific errors
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập hết hạn - vui lòng đăng nhập lại');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                history.push('/user/login');
                throw new Error('Authentication required');
            } else if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message;
                throw new Error(errorMessage || 'File không hợp lệ');
            } else if (error.response?.status === 413) {
                throw new Error('File quá lớn - vui lòng chọn file nhỏ hơn 5MB');
            } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('Upload timeout - vui lòng thử lại');
            } else if (error.message.includes('Network Error')) {
                throw new Error('Lỗi mạng - vui lòng kiểm tra kết nối internet');
            } else {
                throw new Error(error.response?.data?.message || 'Upload thất bại - vui lòng thử lại');
            }
        } finally {
            clearInterval(progressInterval);
            setUploadLoading(false);
        }
    };

    // ✅ Upload multiple images at once (using backend /upload/images endpoint)
    const onUploadMultipleImages = async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        setUploadLoading(true);
        setUploadProgress(0);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file); // ✅ Backend expects 'images' field for multiple upload
        });

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Phiên đăng nhập hết hạn - vui lòng đăng nhập lại');
            }

            const response = await axios.post(
                `${API_BASE_URL}/upload/images`, // ✅ Multiple images endpoint
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 60000, // Longer timeout for multiple files
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(Math.min(progress, 95));
                        }
                    }
                }
            );

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setUploadProgress(100);
                setTimeout(() => setUploadProgress(0), 1000);
                return response.data.data.map((item: any) => item.url);
            } else {
                throw new Error('Upload failed - no URLs returned');
            }
        } catch (error: any) {
            console.error('Multiple upload error:', error);
            setUploadProgress(0);
            
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập hết hạn - vui lòng đăng nhập lại');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                history.push('/user/login');
            }
            
            throw new Error(error.response?.data?.message || 'Upload thất bại');
        } finally {
            setUploadLoading(false);
        }
    };

    // ✅ Handle single image upload
    const handleUpload = async (info: any) => {
        const latestFile = info.file?.originFileObj || info.file;
        if (!latestFile) return;

        if (postImages.length >= 4) {
            message.warning('Chỉ được chọn tối đa 4 ảnh');
            return;
        }

        try {
            const imageUrl = await onUploadImage(latestFile);
            
            if (imageUrl) {
                setPostImages(prev => [...prev, imageUrl]);
                message.success('Upload ảnh thành công!');
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            if (error.message !== 'Authentication required') {
                message.error(error.message || 'Không thể upload ảnh');
            }
        }
    };

    // ✅ Handle multiple images upload at once
    const handleMultipleUpload = async (fileList: File[]) => {
        if (fileList.length === 0) return;

        const remainingSlots = 4 - postImages.length;
        if (fileList.length > remainingSlots) {
            message.warning(`Chỉ có thể thêm ${remainingSlots} ảnh nữa`);
            fileList = fileList.slice(0, remainingSlots);
        }

        // Validate all files first
        for (const file of fileList) {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error(`File "${file.name}" không phải là ảnh hợp lệ`);
                return;
            }

            const isValidSize = file.size / 1024 / 1024 < 5;
            if (!isValidSize) {
                message.error(`File "${file.name}" quá lớn (>5MB)`);
                return;
            }
        }

        try {
            const imageUrls = await onUploadMultipleImages(fileList);
            
            if (imageUrls.length > 0) {
                setPostImages(prev => [...prev, ...imageUrls]);
                message.success(`Upload thành công ${imageUrls.length} ảnh!`);
            }
        } catch (error: any) {
            console.error('Error uploading multiple images:', error);
            if (error.message !== 'Authentication required') {
                message.error(error.message || 'Không thể upload ảnh');
            }
        }
    };

    // ✅ Remove image
    const removeImage = (index: number) => {
        setPostImages(prev => prev.filter((_, i) => i !== index));
        message.success('Đã xóa ảnh');
    };

    // ✅ Submit new review - Updated to check upload loading
    const handleSubmitPost = async (values: any) => {
        if (!currentUser) {
            message.warning('Vui lòng đăng nhập để đăng bài');
            return;
        }

        if (!postContent.trim()) {
            message.warning('Vui lòng nhập nội dung bài viết');
            return;
        }

        // ✅ Check if still uploading images
        if (uploadLoading) {
            message.warning('Vui lòng đợi upload ảnh hoàn tất');
            return;
        }

        setSubmittingPost(true);
        try {
            let gameData = values.game_id;
            let isNewGame = false;
            
            const existingGame = games.find(game => game._id === values.game_id);
            
            if (!existingGame && values.game_id && typeof values.game_id === 'string') {
                isNewGame = true;
                gameData = values.game_id;
            }

            const reviewData = {
                game_id: gameData,
                game_title: isNewGame ? values.game_id : undefined,
                content: postContent.replace(/<[^>]*>/g, ''),
                rating: values.rating,
                images: postImages,
                is_new_game: isNewGame
            };

            await createReview(reviewData);

            if (isNewGame) {
                message.success('Bài review game mới đã được gửi và đang chờ admin duyệt!');
            } else {
                message.success('Bài review đã được gửi và đang chờ duyệt!');
            }
            
            setPostModalOpen(false);
            form.resetFields();
            setPostContent('');
            setPostImages([]);
            
            loadReviews();
            
        } catch (error: any) {
            console.error('Error creating review:', error);
            message.error(error.message || 'Không thể đăng bài viết');
        } finally {
            setSubmittingPost(false);
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
            loadReviews(pagination.page + 1, true);
        }
    };

    // ✅ Navigate to profile
    const navigateToProfile = (userId: string) => {
        history.push(`/profile/${userId}`);
    };

    // ✅ Handle modal cancel with upload check
    const handleModalCancel = () => {
        if (uploadLoading) {
            message.warning('Vui lòng đợi upload ảnh hoàn tất trước khi đóng');
            return;
        }
        setPostModalOpen(false);
        form.resetFields();
        setPostContent('');
        setPostImages([]);
    };

    // ✅ Updated game name display in renderReviewItem
    const renderReviewItem = (review: Review) => {
        const author = typeof review.author_id === 'object' && review.author_id !== null 
            ? review.author_id 
            : null;
        
        const authorName = author?.profile?.username || author?.email?.split('@')[0] || 'Unknown User';
        const authorId = typeof review.author_id === 'string' ? review.author_id : author?._id;
        
        let gameName = 'Unknown Game';
        let isNewGame = false;
        
        if (typeof review.game_id === 'object' && review.game_id !== null && 'title' in review.game_id) {
            gameName = review.game_id.title;
        } else if (typeof review.game_id === 'string') {
            const existingGame = games.find(game => game._id === review.game_id);
            if (existingGame) {
                gameName = existingGame.title;
            } else {
                gameName = review.game_title || review.game_id;
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
                    {/* Post Header */}
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
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    {dayjs(review.created_at).format('DD/MM/YYYY HH:mm')}
                                </Text>
                            </div>
                        </Space>
                        
                        {/* Game Info & Rating with new game indicator */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                <Text strong style={{ color: '#1890ff' }}>
                                    <CameraOutlined style={{ marginRight: 4 }} />
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

                    {/* Post Content */}
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

                        {/* Post Images */}
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
                                                    content: <img src={imageUrl} style={{ width: '100%' }} alt="Full size" />,
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

                    {/* Post Footer */}
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

                    {/* Comment Section */}
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

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#FFFCFE' }}>
            <GameHubHeader
                searchText={searchText}
                setSearchText={setSearchText}
                activeNav={activeNav}
                setActiveNav={handleNavChange}
                NAV_ITEMS={NAV_ITEMS}
            />
            <Navbar
                navItems={NAV_ITEMS}
                activeNav={activeNav}
                setActiveNav={handleNavChange}
                navLinks={{ 
                    0: '/dang-theo-doi', 
                    1: '/home',
                    2: '/bang-xep-hang' 
                }}
            />
            <Content style={{ 
                padding: '24px', 
                backgroundColor: '#FFFCFE', 
                paddingTop: '120px',
                minHeight: 'calc(100vh - 120px)'
            }}>
                {/* Post Button Section */}
                <div style={{ 
                    maxWidth: 700, 
                    margin: '0 auto 32px auto',
                    padding: '0 16px'
                }}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #f0f0f0'
                        }}
                        bodyStyle={{ padding: '16px' }}
                    >
                        <Row align='middle' gutter={16}>
                            <Col>
                                <Avatar 
                                    src={currentUser?.profile?.avatar_url}
                                    icon={<UserOutlined />}
                                    size={40} 
                                />
                            </Col>
                            <Col flex='auto'>
                                <Button
                                    style={{
                                        width: '100%',
                                        height: 44,
                                        background: '#f6f6f6',
                                        border: '1px solid #e8e8e8',
                                        borderRadius: 22,
                                        textAlign: 'left',
                                        fontWeight: 500,
                                        color: '#666',
                                        fontSize: '14px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => {
                                        if (!currentUser) {
                                            message.warning('Vui lòng đăng nhập để đăng bài');
                                            return;
                                        }
                                        setPostModalOpen(true);
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentUser) {
                                            e.currentTarget.style.background = '#e6f7ff';
                                            e.currentTarget.style.borderColor = '#91d5ff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#f6f6f6';
                                        e.currentTarget.style.borderColor = '#e8e8e8';
                                    }}
                                >
                                    <Space>
                                        <PlusOutlined style={{ fontSize: '12px' }} />
                                        <span>
                                            {currentUser ? 'Chia sẻ review game của bạn...' : 'Đăng nhập để chia sẻ review'}
                                        </span>
                                    </Space>
                                </Button>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="text"
                                        icon={<CameraOutlined />}
                                        style={{
                                            borderRadius: '50%',
                                            width: 40,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onClick={() => {
                                            if (!currentUser) {
                                                message.warning('Vui lòng đăng nhập để đăng bài');
                                                return;
                                            }
                                            setPostModalOpen(true);
                                        }}
                                        title="Thêm ảnh"
                                    />
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </div>

                {/* Reviews List Section */}
                <div style={{ 
                    maxWidth: '700px', 
                    margin: '0 auto',
                    padding: '0 16px'
                }}>
                    <div style={{ 
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Title level={4} style={{ margin: 0, color: '#333' }}>
                            🎮 Reviews mới nhất
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {pagination.total} bài viết
                        </Text>
                    </div>

                    <Spin spinning={reviewsLoading && reviews.length === 0}>
                        <List
                            dataSource={reviews}
                            renderItem={renderReviewItem}
                            locale={{ 
                                emptyText: (
                                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                        <Empty 
                                            description={
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: '16px' }}>
                                                        Chưa có bài review nào
                                                    </Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: '14px' }}>
                                                        Hãy là người đầu tiên chia sẻ review game!
                                                    </Text>
                                                </div>
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                        {currentUser && (
                                            <Button 
                                                type="primary" 
                                                size="large"
                                                icon={<PlusOutlined />}
                                                onClick={() => setPostModalOpen(true)}
                                                style={{ marginTop: '16px' }}
                                            >
                                                Viết review đầu tiên
                                            </Button>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </Spin>
                    
                    {/* Load More Button */}
                    {reviews.length < pagination.total && (
                        <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 32 }}>
                            <Button 
                                size="large"
                                loading={reviewsLoading}
                                onClick={handleLoadMore}
                                style={{
                                    borderRadius: 20,
                                    paddingLeft: 32,
                                    paddingRight: 32,
                                    height: 44
                                }}
                            >
                                {reviewsLoading ? 'Đang tải...' : 'Xem thêm bài viết'}
                            </Button>
                        </div>
                    )}
                </div>
            </Content>

            {/* ✅ Enhanced Post Modal with Cloudinary upload via backend */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined style={{ color: '#1890ff' }} />
                        <span>Tạo bài review mới</span>
                    </Space>
                }
                visible={postModalOpen}
                onCancel={handleModalCancel}
                footer={null}
                width={800}
                bodyStyle={{ padding: '24px' }}
                maskClosable={!uploadLoading}
                closable={!uploadLoading}
                destroyOnClose={true}
            >
                {/* ✅ Upload Progress Bar */}
                {uploadProgress > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Progress 
                            percent={uploadProgress} 
                            status={uploadProgress === 100 ? 'success' : 'active'}
                            showInfo={true}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
                            {uploadProgress < 100 ? `Đang upload lên Cloudinary... ${uploadProgress}%` : 'Upload hoàn tất!'}
                        </Text>
                    </div>
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitPost}
                    initialValues={{
                        rating: 5
                    }}
                >
                    <Form.Item
                        label="Game"
                        name="game_id"
                        rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập tên game!' }]}
                    >
                        <Select
                            placeholder="Tìm game có sẵn hoặc nhập tên game mới..."
                            showSearch
                            allowClear
                            filterOption={(input: string, option?: any) =>
                                option?.children?.toLowerCase().includes(input.toLowerCase()) ?? false
                            }
                            size="large"
                            loading={games.length === 0}
                            notFoundContent={games.length === 0 ? <Spin size="small" /> : null}
                            dropdownRender={(menu) => (
                                <div>
                                    {menu}
                                    <div style={{ 
                                        padding: '8px 12px', 
                                        borderTop: '1px solid #f0f0f0',
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        💡 Gõ tên game để giới thiệu game mới
                                    </div>
                                </div>
                            )}
                        >
                            <Option key="new-game-option" value="" disabled style={{ display: 'none' }}>
                                Nhập tên game mới...
                            </Option>
                            {games.map(game => (
                                <Option key={game._id} value={game._id}>
                                    {game.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Đánh giá"
                        name="rating"
                        rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}
                    >
                        <Rate style={{ fontSize: 24 }} />
                    </Form.Item>

                    <Form.Item 
                        label="Nội dung review"
                        help={
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {form.getFieldValue('game_id') && !games.find(g => g._id === form.getFieldValue('game_id')) 
                                    ? '💡 Bạn đang giới thiệu game mới - hãy mô tả chi tiết về game này!'
                                    : 'Chia sẻ trải nghiệm và đánh giá của bạn về game'
                                }
                            </Text>
                        }
                        rules={[
                            { required: true, message: 'Vui lòng nhập nội dung!' },
                            { min: 50, message: 'Nội dung review cần ít nhất 50 ký tự để có ý nghĩa!' }
                        ]}
                    >
                        <Input.TextArea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder={
                                form.getFieldValue('game_id') && !games.find(g => g._id === form.getFieldValue('game_id'))
                                    ? "Mô tả game này: thể loại, gameplay, điểm hay/dở, có nên chơi không..."
                                    : "Chia sẻ trải nghiệm của bạn về game này..."
                            }
                            rows={6}
                            maxLength={2000}
                            showCount
                            style={{ resize: 'none' }}
                        />
                    </Form.Item>

                    {/* ✅ Enhanced Image Upload using backend Cloudinary API */}
                    <Form.Item label="Hình ảnh (tối đa 4)">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            {postImages.map((imageUrl, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img
                                        src={imageUrl}
                                        alt={`Upload ${index + 1}`}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            border: '1px solid #d9d9d9'
                                        }}
                                    />
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        style={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            borderRadius: '50%',
                                            minWidth: 20,
                                            height: 20,
                                            padding: 0,
                                            backgroundColor: '#fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        onClick={() => removeImage(index)}
                                        disabled={uploadLoading}
                                    />
                                </div>
                            ))}
                            
                            {/* ✅ Upload Button with multiple file support */}
                            {postImages.length < 4 && (
                                <Upload
                                    beforeUpload={() => false}
                                    onChange={handleUpload}
                                    showUploadList={false}
                                    accept="image/*"
                                    multiple={true} // ✅ Allow multiple file selection
                                    disabled={uploadLoading}
                                    onDrop={(e) => {
                                        // ✅ Handle drag & drop multiple files
                                        e.preventDefault();
                                        const files = Array.from(e.dataTransfer.files) as File[];
                                        if (files.length > 0) {
                                            handleMultipleUpload(files);
                                        }
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 80,
                                            height: 80,
                                            border: uploadLoading ? '2px solid #bfbfbf' : '2px dashed #d9d9d9',
                                            borderRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: uploadLoading ? 'not-allowed' : 'pointer',
                                            fontSize: 24,
                                            color: uploadLoading ? '#bfbfbf' : '#8c8c8c',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: uploadLoading ? '#f5f5f5' : 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!uploadLoading) {
                                                e.currentTarget.style.borderColor = '#1890ff';
                                                e.currentTarget.style.color = '#1890ff';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!uploadLoading) {
                                                e.currentTarget.style.borderColor = '#d9d9d9';
                                                e.currentTarget.style.color = '#8c8c8c';
                                            }
                                        }}
                                    >
                                        {uploadLoading ? (
                                            <LoadingOutlined />
                                        ) : (
                                            <PlusOutlined />
                                        )}
                                    </div>
                                </Upload>
                            )}
                        </div>
                        
                        <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                            Chỉ chấp nhận file hình ảnh (JPG, PNG, JPEG), tối đa 5MB mỗi file. 
                            Có thể chọn nhiều file cùng lúc hoặc kéo thả vào đây.
                            Ảnh sẽ được lưu trữ an toàn trên Cloudinary.
                            {postImages.length > 0 && (
                                <span style={{ color: '#1890ff', marginLeft: 8 }}>
                                    ({postImages.length}/4 ảnh đã chọn)
                                </span>
                            )}
                        </Text>
                    </Form.Item>

                    {/* ✅ Submit Button */}
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                        <Space>
                            <Button 
                                onClick={handleModalCancel}
                                disabled={submittingPost || uploadLoading}
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={submittingPost}
                                size="large"
                                disabled={
                                    !postContent.trim() || 
                                    uploadLoading
                                }
                                icon={submittingPost ? <LoadingOutlined /> : <PlusOutlined />}
                            >
                                {submittingPost ? 'Đang đăng...' : 'Đăng bài'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default TrangChu;