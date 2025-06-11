import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'umi';
import useUserModel from '../../models/user';
import { fetchReviewsByUser, fetchMyReviews, fetchReviews } from '../../models/review';
import type { User, FollowUser } from '../../services/UserServices';
import type { Review } from '../../services/ReviewServices';
import { 
  Card, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Spin, 
  Button, 
  List,
  Rate,
  Empty,
  message,
  Space,
  Modal,
  Layout
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  MailOutlined,
  EditOutlined,
  TeamOutlined,
  StarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseOutlined,
  UserAddOutlined,
  UserDeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import styles from './index.less';
import EditProfileModal from './components/EditProfileModal';
// ✅ Import GameHub Header
import GameHubHeader from '@/components/GameHub/Header';
import { toggleReviewLike } from '../../models/comment';
import CommentSection from './components/CommentSection';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const history = useHistory();
  
  // ✅ Add states for GameHub Header
  const [searchText, setSearchText] = useState('');
  const [activeNav, setActiveNav] = useState(0);
  
  const NAV_ITEMS = [
    { label: 'Trang chủ', key: 0 },
    { label: 'Khám phá', key: 1 },
    { label: 'Theo dõi', key: 2 },
    { label: 'Thông báo', key: 3 }
  ];
  
  const {
    followLoading,
    followersData,
    followingData,
    followModalLoading,
    followCounts,
    followStatus,
    getFollowers,
    getFollowing,
    checkFollowStatus,
    getFollowCounts,
    toggleFollow,
    editProfileVisible,
    editProfileLoading,
    uploadLoading,
    updateUserProfile,
    uploadImage,
    showEditProfileModal,
    hideEditProfileModal,
  } = useUserModel();

  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  
  // ✅ Sử dụng reviews làm posts
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // ✅ Add states for likes
  const [reviewLikes, setReviewLikes] = useState<{[key: string]: boolean}>({});
  const [reviewLikeCounts, setReviewLikeCounts] = useState<{[key: string]: number}>({});
  
  // ✅ Enhanced loading states for different operations
  const [likingReview, setLikingReview] = useState<{[key: string]: boolean}>({});
  const [refreshingData, setRefreshingData] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Get current user
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

  // Get user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
      setInitialLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_BASE_URL}/auth/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          message.error('Không thể tải thông tin người dùng');
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        const status = error.response?.status;
        if (status === 404) message.error('Không tìm thấy người dùng');
        else if (status === 401) message.error('Bạn cần đăng nhập để xem thông tin này');
        else message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải profile');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Get follow data and user posts (reviews)
  useEffect(() => {
    if (user?._id) {
      const loadUserData = async () => {
        setRefreshingData(true);
        try {
          // ✅ Load follow data
          await Promise.all([
            getFollowCounts(user._id),
            currentUser && currentUser._id !== user._id ? checkFollowStatus(user._id) : Promise.resolve()
          ]);

          // ✅ Load user reviews
          await fetchUserReviews();
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setRefreshingData(false);
        }
      };

      loadUserData();
    }
  }, [user?._id, currentUser?._id]);

  // ✅ Separate function for fetching reviews
  const fetchUserReviews = async () => {
    if (!user?._id) return;
    
    setReviewsLoading(true);
    try {
      const isOwnProfile = currentUser?._id === user._id;
      
      let reviews: Review[] = [];
      
      if (isOwnProfile) {
        try {
          const { reviews: allReviews } = await fetchReviews({ 
            limit: 50,
            userId: currentUser._id 
          });
          reviews = allReviews;
        } catch (error) {
          console.log('Fallback: Using general reviews endpoint');
          const { reviews: allReviews } = await fetchReviews({ limit: 100 });
          reviews = allReviews.filter(review => {
            if (typeof review.author_id === 'string') {
              return review.author_id === currentUser._id;
            }
            if (review.author_id && typeof review.author_id._id === 'string') {
              return review.author_id._id === currentUser._id;
            }
            return false;
          });
        }
      } else {
        const { reviews: userReviews } = await fetchReviewsByUser(user._id, { 
          limit: 50, 
          status: 'approved' 
        });
        reviews = userReviews;
      }
      
      setUserReviews(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      try {
        const { reviews: allReviews } = await fetchReviews({ limit: 100 });
        const filteredReviews = allReviews.filter(review => {
          let reviewUserId: string | undefined;
          if (typeof review.author_id === 'string') {
            reviewUserId = review.author_id;
          } else if (review.author_id && typeof review.author_id._id === 'string') {
            reviewUserId = review.author_id._id;
          }
          const isOwnProfile = currentUser?._id === user._id;
          return reviewUserId === user._id && 
                 (!isOwnProfile ? review.status === 'approved' : true);
        });
        setUserReviews(filteredReviews);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setUserReviews([]);
        message.error('Không thể tải bài viết');
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  // ✅ Load like status for reviews từ backend data
  useEffect(() => {
    const loadLikeStatus = () => {
      if (currentUser && userReviews.length > 0) {
        console.log('🔍 Loading like status for reviews');
        
        const initialLikeCounts: {[key: string]: number} = {};
        const initialLikeStatus: {[key: string]: boolean} = {};
        
        userReviews.forEach(review => {
          console.log(`📊 Processing review ${review._id}:`, {
            likes_count: review.likes_count,
            likes: review.likes,
            virtualLikesCount: review.likes?.length
          });
          
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
          
          console.log(`✅ Review ${review._id} - Liked: ${initialLikeStatus[review._id]}, Count: ${initialLikeCounts[review._id]}`);
        });
        
        setReviewLikeCounts(initialLikeCounts);
        setReviewLikes(initialLikeStatus);
      }
    };

    loadLikeStatus();
  }, [currentUser, userReviews]);

  // ✅ Handle like/unlike review with better logic
  const handleToggleReviewLike = async (reviewId: string) => {
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để thích bài viết');
      return;
    }

    console.log('🔄 Toggling like for review:', reviewId);
    
    // ✅ Store the current state BEFORE API call
    const wasLiked = reviewLikes[reviewId] || false;
    
    setLikingReview(prev => ({ ...prev, [reviewId]: true }));
    
    try {
      const result = await toggleReviewLike(reviewId);
      
      console.log('✅ Toggle result:', result);
      console.log('Was liked before:', wasLiked, 'Is liked after:', result.liked);
      
      // ✅ Update state with API result
      setReviewLikes(prev => ({ ...prev, [reviewId]: result.liked }));
      setReviewLikeCounts(prev => ({ ...prev, [reviewId]: result.likesCount }));
      
      // ✅ Show message based on the change that actually happened
      if (!wasLiked && result.liked) {
        message.success('Đã thích bài viết');
      } else if (wasLiked && !result.liked) {
        message.success('Đã bỏ thích bài viết');
      } else if (result.liked) {
        // Fallback: if we can't determine the previous state clearly
        message.success('Đã thích bài viết');
      } else {
        message.success('Đã bỏ thích bài viết');
      }
      
    } catch (error: any) {
      console.error('💥 Error toggling review like:', error);
      message.error(error.message || 'Không thể thích/bỏ thích bài viết');
    } finally {
      setLikingReview(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // ✅ Fixed follow handler - remove duplicate messages
  const handleFollow = async () => {
    if (!currentUser || !user) {
      message.warning('Vui lòng đăng nhập để theo dõi');
      return;
    }
    if (currentUser._id === user._id) {
      message.warning('Bạn không thể theo dõi chính mình');
      return;
    }
    
    try {
      // ✅ Store initial follow status to determine action
      const wasFollowing = followStatus[user._id] || false;
      
      // ✅ Call toggle follow - this already handles messages internally
      await toggleFollow(user._id);
      
      // ✅ Update follow counts after successful toggle
      await getFollowCounts(user._id);
      
      // ✅ DON'T show additional message here since toggleFollow already shows one
      // The model already handles success/error messages
      
    } catch (error) {
      // ✅ Only show error if toggleFollow didn't handle it
      console.error('Follow error in component:', error);
      // Error messages are already handled in the model
    }
  };

  // ✅ Refresh data function
  const handleRefreshData = async () => {
    if (!user?._id) return;
    
    setRefreshingData(true);
    try {
      await Promise.all([
        fetchUserReviews(),
        getFollowCounts(user._id)
      ]);
      message.success('Đã làm mới dữ liệu');
    } catch (error) {
      message.error('Không thể làm mới dữ liệu');
    } finally {
      setRefreshingData(false);
    }
  };

  // Handle comments count change
  const handleCommentsCountChange = (reviewId: string, count: number) => {
    setUserReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, replies_count: count }
        : review
    ));
  };

  // ✅ Modal handlers with loading states
  const showFollowersModal = async () => {
    setFollowersModalVisible(true);
    if (user?._id) {
      try {
        await getFollowers(user._id);
      } catch (error) {
        message.error('Không thể tải danh sách followers');
      }
    }
  };

  const showFollowingModal = async () => {
    setFollowingModalVisible(true);
    if (user?._id) {
      try {
        await getFollowing(user._id);
      } catch (error) {
        message.error('Không thể tải danh sách following');
      }
    }
  };

  const navigateToUserProfile = (userId: string) => {
    setFollowersModalVisible(false);
    setFollowingModalVisible(false);
    // ✅ Add loading when navigating
    setInitialLoading(true);
    history.push(`/profile/${userId}`);
  };

  const handleEditProfileSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    message.success('Profile đã được cập nhật thành công!');
  };

  // Render functions
  const renderUserItem = (followUser: FollowUser) => {
    if (!followUser?._id) return null;

    const username = followUser.profile?.username || 
                    followUser.email?.split('@')[0] || 
                    `User${followUser._id.slice(-4)}`;

    return (
      <List.Item key={followUser._id} className={styles['user-item']}>
        <div 
          className={styles['user-item__container']}
          onClick={() => navigateToUserProfile(followUser._id)}
          style={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 0',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Avatar
            size={40}
            src={followUser.profile?.avatar_url}
            icon={<UserOutlined />}
            style={{ border: '2px solid #f0f0f0', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text 
              strong 
              style={{
                fontSize: '14px',
                color: '#262626',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {username}
              {followUser.is_verified && (
                <CheckCircleFilled 
                  style={{ 
                    color: '#1890ff',
                    fontSize: '12px',
                    marginLeft: '4px'
                  }}
                />
              )}
            </Text>
          </div>
        </div>
      </List.Item>
    );
  };

  // ✅ Render posts with enhanced loading states
  const renderReviews = () => (
    <div className={styles['posts-container']}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px' 
      }}>
        <Title level={4} style={{ margin: 0 }}>
          Bài viết ({userReviews.length})
        </Title>
        <Button 
          type="text" 
          onClick={handleRefreshData}
          loading={refreshingData}
          style={{ fontSize: '12px' }}
        >
          Làm mới
        </Button>
      </div>
      
      <Spin spinning={reviewsLoading || refreshingData}>
        <List
          dataSource={userReviews}
          renderItem={(review: Review) => (
            <List.Item className={styles['post-item']}>
              <Card className={styles['post-card']}>
                {/* Post Header */}
                <div className={styles['post-header']}>
                  <Space>
                    <Avatar
                      src={user?.profile?.avatar_url}
                      icon={<UserOutlined />}
                      size={40}
                    />
                    <div>
                      <Text strong>{user?.profile?.username || user?.email?.split('@')[0]}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {dayjs(review.created_at).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </div>
                  </Space>
                  
                  {/* Game Info & Rating */}
                  <div className={styles['post-meta']}>
                    <Text strong style={{ color: '#1890ff' }}>
                      {typeof review.game_id === 'object' && review.game_id !== null && 'title' in review.game_id
                        ? review.game_id.title
                        : typeof review.game_id === 'string'
                          ? review.game_id
                          : 'Unknown Game'}
                    </Text>
                    <Rate disabled value={review.rating} style={{ marginLeft: 8 }} />
                    {currentUser?._id === user?._id && (
                      <Tag 
                        color={review.status === 'approved' ? 'green' : review.status === 'pending' ? 'orange' : 'red'}
                        style={{ marginLeft: 8 }}
                      >
                        {review.status === 'approved' ? 'Đã duyệt' : review.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className={styles['post-content']}>
                  <Paragraph 
                    style={{ 
                      fontSize: '15px', 
                      lineHeight: '1.6',
                      marginBottom: '16px'
                    }}
                  >
                    {review.content}
                  </Paragraph>

                  {/* Post Images */}
                  {review.images && review.images.length > 0 && (
                    <div className={styles['post-images']}>
                      <Space wrap size="small">
                        {review.images.slice(0, 4).map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            style={{
                              width: 120,
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '1px solid #f0f0f0'
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

                {/* ✅ Post Footer with Enhanced Loading States */}
                <div className={styles['post-footer']}>
                  <Space size="large">
                    <Button
                      type="text"
                      size="small"
                      loading={likingReview[review._id]}
                      onClick={() => handleToggleReviewLike(review._id)}
                      disabled={!currentUser || likingReview[review._id]}
                      style={{ 
                        padding: '4px 8px',
                        height: 'auto',
                        color: reviewLikes[review._id] ? '#ff4d4f' : '#8c8c8c'
                      }}
                    >
                      <Space size={4}>
                        <StarOutlined style={{ 
                          color: reviewLikes[review._id] ? '#ff4d4f' : '#8c8c8c'
                        }} />
                        <span>{reviewLikeCounts[review._id] || 0} lượt thích</span>
                      </Space>
                    </Button>
                  </Space>

                  {/* ✅ Comment Section */}
                  <CommentSection
                    reviewId={review._id}
                    currentUser={currentUser}
                    commentsCount={review.replies_count || 0}
                    onCommentsCountChange={(count) => handleCommentsCountChange(review._id, count)}
                  />
                </div>
              </Card>
            </List.Item>
          )}
          locale={{ 
            emptyText: (
              <Empty 
                description={
                  reviewsLoading ? "Đang tải bài viết..." : 
                  currentUser?._id === user?._id ? "Bạn chưa có bài viết nào" :
                  "Người này chưa có bài viết nào"
                } 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            )
          }}
        />
      </Spin>
    </div>
  );

  // ✅ Enhanced loading state for initial page load
  if (initialLoading || loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {/* ✅ Add Header even during loading */}
        <GameHubHeader
          searchText={searchText}
          setSearchText={setSearchText}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          NAV_ITEMS={NAV_ITEMS}
        />
        <Content style={{ 
          marginTop: '54px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 54px)',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <Text type="secondary">Đang tải thông tin người dùng...</Text>
        </Content>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {/* ✅ Add Header for error state */}
        <GameHubHeader
          searchText={searchText}
          setSearchText={setSearchText}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          NAV_ITEMS={NAV_ITEMS}
        />
        <Content style={{ 
          marginTop: '54px',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '60px 20px',
          minHeight: 'calc(100vh - 54px)'
        }}>
          <Empty 
            description="Không tìm thấy người dùng" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button 
            type="primary" 
            size="large"
            onClick={() => history.push('/home')}
            style={{ marginTop: 16 }}
          >
            Về trang chủ
          </Button>
        </Content>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;
  const isFollowing = user?._id ? followStatus[user._id] || false : false;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ✅ Add GameHub Header */}
      <GameHubHeader
        searchText={searchText}
        setSearchText={setSearchText}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        NAV_ITEMS={NAV_ITEMS}
      />
      
      {/* ✅ Main Content with proper spacing */
      }
      <Content style={{ 
        marginTop: '54px', // Space for fixed header
        minHeight: 'calc(100vh - 54px)',
        background: '#f5f5f5'
      }}>
        <div className={styles['user-profile']}>
          {/* ✅ Global loading overlay for data refresh */}
          <Spin 
            spinning={refreshingData} 
            tip="Đang làm mới dữ liệu..."
            size="large"
          >
            <div className={styles['user-profile__container']}>
              {/* Profile Header */}
              <Card className={styles['profile-header']}>
                <div 
                  className={styles['profile-cover']}
                  style={user.profile?.cover_url ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${user.profile.cover_url})`
                  } : {}}
                >
                  <Avatar
                    size={100}
                    src={user.profile?.avatar_url}
                    icon={<UserOutlined />}
                    className={styles['profile-avatar']}
                  />
                </div>

                <div className={styles['profile-info']}>
                  <Row justify="space-between" align="top" gutter={[24, 16]}>
                    <Col flex="auto">
                      <Space align="baseline" size="small">
                        <Title level={2} style={{ marginBottom: 8 }}>
                          {user.profile?.username || user.email?.split('@')[0] || 'User'}
                        </Title>
                        {user.is_verified && <CheckCircleFilled style={{ color: '#1890ff', fontSize: 20 }} />}
                      </Space>
                      
                      <Space wrap style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                          <MailOutlined style={{ marginRight: 6 }} />
                          {user.email}
                        </Text>
                        <Text type="secondary">
                          <CalendarOutlined style={{ marginRight: 6 }} />
                          Tham gia {dayjs(user.created_at).format('MMM YYYY')}
                        </Text>
                      </Space>

                      <Space wrap size="small" style={{ marginBottom: 16 }}>
                        <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                          {user.role.toUpperCase()}
                        </Tag>
                        {user.status === 'banned' && <Tag color="volcano">BANNED</Tag>}
                      </Space>

                      {/* ✅ Stats with loading states */}
                      <Row gutter={24}>
                        <Col>
                          <div>
                            <Title level={4} style={{ marginBottom: 0 }}>
                              {reviewsLoading ? '-' : userReviews.length || 0}
                            </Title>
                            <Text type="secondary">Bài viết</Text>
                          </div>
                        </Col>
                        <Col>
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={showFollowersModal}
                          >
                            <Title level={4} style={{ marginBottom: 0 }}>
                              {followCounts.followers || 0}
                            </Title>
                            <Text type="secondary">Followers</Text>
                          </div>
                        </Col>
                        <Col>
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={showFollowingModal}
                          >
                            <Title level={4} style={{ marginBottom: 0 }}>
                              {followCounts.following || 0}
                            </Title>
                            <Text type="secondary">Following</Text>
                          </div>
                        </Col>
                      </Row>
                    </Col>

                    <Col>
                      <Space direction="vertical" size="small">
                        {!isOwnProfile && currentUser && (
                          <Button
                            type={isFollowing ? 'default' : 'primary'}
                            icon={isFollowing ? <UserDeleteOutlined /> : <UserAddOutlined />}
                            loading={followLoading}
                            onClick={handleFollow}
                            size="large"
                          >
                            {followLoading ? 'Đang xử lý...' : (isFollowing ? 'Bỏ theo dõi' : 'Theo dõi')}
                          </Button>
                        )}
                        
                        {isOwnProfile && (
                          <Button 
                            icon={<EditOutlined />}
                            size="large"
                            onClick={showEditProfileModal}
                            loading={editProfileLoading}
                          >
                            Chỉnh sửa profile
                          </Button>
                        )}
                        
                        {!currentUser && !isOwnProfile && (
                          <Button 
                            type="primary"
                            icon={<UserAddOutlined />}
                            size="large"
                            onClick={() => message.warning('Vui lòng đăng nhập để theo dõi')}
                          >
                            Theo dõi
                          </Button>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </div>
              </Card>

              {/* ✅ Enhanced Posts Content */}
              {renderReviews()}

              {/* ✅ Enhanced Modals with loading states */}
              <Modal
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>Followers ({followCounts.followers || 0})</span>
                  </Space>
                }
                visible={followersModalVisible}
                onCancel={() => setFollowersModalVisible(false)}
                footer={null}
                width={480}
                bodyStyle={{ maxHeight: '400px', overflowY: 'auto', padding: '16px 0' }}
              >
                <Spin spinning={followModalLoading} tip="Đang tải danh sách followers...">
                  <div style={{ padding: '0 24px' }}>
                    {followersData.length > 0 ? (
                      <List
                        dataSource={followersData.filter(item => item?._id)}
                        renderItem={renderUserItem}
                        split={false}
                      />
                    ) : (
                      <Empty 
                        description={followModalLoading ? "Đang tải..." : "Chưa có followers"} 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Spin>
              </Modal>

              <Modal
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>Following ({followCounts.following || 0})</span>
                  </Space>
                }
                visible={followingModalVisible}
                onCancel={() => setFollowingModalVisible(false)}
                footer={null}
                width={480}
                bodyStyle={{ maxHeight: '400px', overflowY: 'auto', padding: '16px 0' }}
              >
                <Spin spinning={followModalLoading} tip="Đang tải danh sách following...">
                  <div style={{ padding: '0 24px' }}>
                    {followingData.length > 0 ? (
                      <List
                        dataSource={followingData.filter(item => item?._id)}
                        renderItem={renderUserItem}
                        split={false}
                      />
                    ) : (
                      <Empty 
                        description={followModalLoading ? "Đang tải..." : "Chưa follow ai"} 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Spin>
              </Modal>

              {isOwnProfile && user && (
                <EditProfileModal
                  visible={editProfileVisible}
                  onCancel={hideEditProfileModal}
                  onSuccess={handleEditProfileSuccess}
                  user={user}
                  loading={editProfileLoading}
                  uploadLoading={uploadLoading}
                  onUpdateProfile={updateUserProfile}
                  onUploadImage={uploadImage}
                />
              )}
            </div>
          </Spin>
        </div>
      </Content>
    </Layout>
  );
};

export default UserProfile;