import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'umi';
import useUserModel from '../../models/user';
import type { User, FollowUser, Comment, Review, Post } from '../../services/UserServices';
import { 
  Card, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  Spin, 
  Button, 
  Tabs,
  List,
  Rate,
  Empty,
  message,
  Space,
  Badge,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  MailOutlined,
  EditOutlined,
  TeamOutlined,
  FileTextOutlined,
  StarOutlined,
  MessageOutlined,
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

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const history = useHistory();
  
  // ✅ Update useUserModel để include edit profile functions
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

  // Lấy thông tin user hiện tại từ localStorage
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

  // Lấy thông tin user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
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
        if (error.response?.status === 404) {
          message.error('Không tìm thấy người dùng');
        } else if (error.response?.status === 401) {
          message.error('Bạn cần đăng nhập để xem thông tin này');
        } else {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // ✅ Lấy follow counts và status khi user thay đổi
  useEffect(() => {
    if (user?._id) {
      getFollowCounts(user._id);
      
      // Check follow status if not own profile
      if (currentUser && currentUser._id !== user._id) {
        checkFollowStatus(user._id);
      }
    }
  }, [user?._id, currentUser?._id]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!currentUser || !user) {
      message.warning('Vui lòng đăng nhập để follow');
      return;
    }

    if (currentUser._id === user._id) {
      message.warning('Bạn không thể follow chính mình');
      return;
    }

    await toggleFollow(user._id);
    // ✅ Refresh follow counts after follow/unfollow
    await getFollowCounts(user._id);
  };

  // Handle show followers modal
  const showFollowersModal = () => {
    setFollowersModalVisible(true);
    if (user?._id) {
      getFollowers(user._id);
    }
  };

  // Handle show following modal
  const showFollowingModal = () => {
    setFollowingModalVisible(true);
    if (user?._id) {
      getFollowing(user._id);
    }
  };


  // ✅ Navigate to user profile
  const navigateToUserProfile = (userId: string) => {
    history.push(`/profile/${userId}`);
    setFollowersModalVisible(false);
    setFollowingModalVisible(false);
  };

  const isFollowingProfile = user?._id ? followStatus[user._id] || false : false;

  // ✅ Clean render user item without debug
  const renderUserItem = (followUser: FollowUser, index: number) => {
    if (!followUser || !followUser._id) {
      return null;
    }

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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Avatar
            size={40}
            src={followUser.profile?.avatar_url}
            icon={<UserOutlined />}
            style={{ 
              cursor: 'pointer',
              border: '2px solid #f0f0f0',
              flexShrink: 0
            }}
          />
          <div 
            className={styles['user-item__info']}
            style={{ 
              cursor: 'pointer',
              flex: 1,
              minWidth: 0
            }}
          >
            <div className={styles['user-item__name-row']}>
              <Text 
                strong 
                className={styles['user-item__name']}
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
              </Text>
              {followUser.is_verified && (
                <CheckCircleFilled 
                  className={styles['user-item__verified-icon']}
                  style={{ 
                    color: '#1890ff',
                    fontSize: '12px',
                    marginLeft: '4px'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </List.Item>
    );
  };

  const renderPosts = () => (
    <div className={styles['profile-content__tab-content']}>
      <List
        dataSource={user?.posts || []}
        renderItem={(post: Post) => (
          <List.Item className={styles['content-item']}>
            <Card 
              hoverable
              className={`${styles['content-item__card']} ${styles['hover-lift']}`}
            >
              <div>
                <Title level={5} className={styles['content-item__title']}>
                  {post.title}
                </Title>
                <Paragraph 
                  ellipsis={{ rows: 3 }} 
                  className={styles['content-item__content']}
                >
                  {post.content}
                </Paragraph>
                <div className={styles['flex-between']}>
                  <Text type="secondary" className={styles['content-item__meta']}>
                    <ClockCircleOutlined className={styles['content-item__time-icon']} />
                    {dayjs(post.created_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="Chưa có bài viết nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />
    </div>
  );

  const renderReviews = () => (
    <div className={styles['profile-content__tab-content']}>
      <List
        dataSource={user?.reviews || []}
        renderItem={(review: Review) => (
          <List.Item className={styles['content-item']}>
            <Card 
              hoverable
              className={`${styles['content-item__card']} ${styles['hover-lift']}`}
            >
              <div className={styles['review-item__header']}>
                <div>
                  <Title level={5} className={styles['review-item__game-title']}>
                    {review.game_name}
                  </Title>
                  <Rate disabled value={review.rating} className={styles['review-item__rating']} />
                </div>
                <Badge 
                  count={review.rating} 
                  className={`${styles['review-item__badge']} ${
                    review.rating >= 4 ? styles['review-item__badge--excellent'] :
                    review.rating >= 3 ? styles['review-item__badge--good'] :
                    styles['review-item__badge--poor']
                  }`}
                />
              </div>
              <Paragraph 
                ellipsis={{ rows: 3 }} 
                className={styles['content-item__content']}
              >
                {review.content}
              </Paragraph>
              <Text type="secondary" className={styles['content-item__meta']}>
                <ClockCircleOutlined className={styles['content-item__time-icon']} />
                {dayjs(review.created_at).format('DD/MM/YYYY HH:mm')}
              </Text>
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="Chưa có đánh giá nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />
    </div>
  );

  const renderComments = () => (
    <div className={styles['profile-content__tab-content']}>
      <List<Comment>
        dataSource={user?.comments as Comment[] || []}
        renderItem={(comment: Comment) => (
          <List.Item className={styles['content-item']}>
            <Card 
              hoverable
              className={`${styles['content-item__card']} ${styles['hover-lift']}`}
            >
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                className={styles['content-item__content']}
              >
                {comment.content || ''}
              </Paragraph>
              <Text type="secondary" className={styles['content-item__meta']}>
                <ClockCircleOutlined className={styles['content-item__time-icon']} />
                {dayjs(comment.created_at).format('DD/MM/YYYY HH:mm')}
              </Text>
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="Chưa có bình luận nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
      />
    </div>
  );

  // ✅ Handle edit profile success
  const handleEditProfileSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    message.success('Profile đã được cập nhật thành công!');
  };

  if (loading) {
    return (
      <div className={styles['user-profile-loading']}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles['user-profile-not-found']}>
        <Empty 
          description="Không tìm thấy người dùng" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className={styles['user-profile-not-found__empty']}
        />
        <Button 
          type="primary" 
          size="large"
          onClick={() => history.push('/')}
          className={styles['user-profile-not-found__button']}
        >
          Về trang chủ
        </Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;
  const isFollowing = isFollowingProfile;

  return (
    <div className={`${styles['user-profile']} ${styles['fade-in']}`}>
      <div className={styles['user-profile__container']}>
        
        {/* Profile Header */}
        <Card className={styles['profile-header']}>
          {/* Cover Image */}
          <div 
            className={`${styles['profile-header__cover']} ${
              user.profile?.cover_url 
                ? styles['profile-header__cover--custom']
                : styles['profile-header__cover--default']
            }`}
            style={user.profile?.cover_url ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${user.profile.cover_url})`
            } : {}}
          >
            <Avatar
              size={100}
              src={user.profile?.avatar_url}
              icon={<UserOutlined />}
              className={styles['profile-header__avatar']}
            />
          </div>

          {/* Profile Info */}
          <div className={styles['profile-header__info']}>
            <Row justify="space-between" align="top" gutter={[24, 16]}>
              <Col flex="auto">
                <div className={styles['profile-header__name-section']}>
                  <Space align="baseline" size="small" className={styles['profile-header__name-row']}>
                    <Title level={2}>
                      {user.profile?.username || user.email?.split('@')[0] || 'User'}
                    </Title>
                    {user.is_verified && (
                      <CheckCircleFilled className={styles['profile-header__verified-icon']} />
                    )}
                  </Space>
                  
                  <Space wrap className={styles['profile-header__meta-info']}>
                    <Text type="secondary">
                      <MailOutlined style={{ marginRight: 6 }} />
                      {user.email}
                    </Text>
                    <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: 6 }} />
                      Tham gia {dayjs(user.created_at).format('MMM YYYY')}
                    </Text>
                  </Space>

                  <Space wrap size="small">
                    <Tag 
                      color={user.role === 'admin' ? 'red' : 'blue'} 
                      className={styles['profile-header__role-tag']}
                    >
                      {user.role.toUpperCase()}
                    </Tag>
                    {user.status === 'banned' && (
                      <Tag color="volcano" className={styles['profile-header__banned-tag']}>
                        BANNED
                      </Tag>
                    )}
                  </Space>
                </div>

                {/* ✅ Stats - Sử dụng dữ liệu thực từ API */}
                <Row gutter={[24, 8]}>
                  <Col>
                    <div className={`${styles['profile-stats__item']} ${styles['profile-stats__item--non-clickable']}`}>
                      <Title level={4} className={styles['profile-stats__number']}>
                        {user.posts?.length || 0}
                      </Title>
                      <Text type="secondary" className={styles['profile-stats__label']}>Bài viết</Text>
                    </div>
                  </Col>
                  <Col>
                    <div className={`${styles['profile-stats__item']} ${styles['profile-stats__item--non-clickable']}`}>
                      <Title level={4} className={styles['profile-stats__number']}>
                        {user.reviews?.length || 0}
                      </Title>
                      <Text type="secondary" className={styles['profile-stats__label']}>Đánh giá</Text>
                    </div>
                  </Col>
                  <Col>
                    <div 
                      className={`${styles['profile-stats__item']} ${styles['profile-stats__item--clickable']}`}
                      onClick={showFollowersModal}
                      style={{ cursor: 'pointer' }}
                    >
                      <Title level={4} className={styles['profile-stats__number']}>
                        {followCounts.followers || 0}
                      </Title>
                      <Text type="secondary" className={styles['profile-stats__label']}>Followers</Text>
                    </div>
                  </Col>
                  <Col>
                    <div 
                      className={`${styles['profile-stats__item']} ${styles['profile-stats__item--clickable']}`}
                      onClick={showFollowingModal}
                      style={{ cursor: 'pointer' }}
                    >
                      <Title level={4} className={styles['profile-stats__number']}>
                        {followCounts.following || 0}
                      </Title>
                      <Text type="secondary" className={styles['profile-stats__label']}>Following</Text>
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col>
                <Space direction="vertical" size="small" className={styles['profile-actions']}>
                  {!isOwnProfile && currentUser && (
                    <Button
                      type={isFollowing ? 'default' : 'primary'}
                      icon={isFollowing ? <UserDeleteOutlined /> : <UserAddOutlined />}
                      loading={followLoading}
                      onClick={handleFollow}
                      size="large"
                      className={`${styles['profile-actions__button']} ${
                        isFollowing 
                          ? styles['profile-actions__follow-button--following']
                          : styles['profile-actions__follow-button--not-following']
                      }`}
                    >
                      {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                    </Button>
                  )}
                  
                  {/* ✅ Replace placeholder edit button với real functionality */}
                  {isOwnProfile && (
                    <Button 
                      icon={<EditOutlined />}
                      size="large"
                      className={styles['profile-actions__button']}
                      onClick={showEditProfileModal}
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
                      className={styles['profile-actions__button']}
                    >
                      Theo dõi
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Content Tabs */}
        <Card className={styles['profile-content']}>
          <Tabs 
            defaultActiveKey="posts"
            size="large"
          >
            <TabPane 
              tab={
                <Space>
                  <FileTextOutlined />
                  <span>Bài viết</span>
                  <Badge 
                    count={user.posts?.length || 0} 
                    showZero 
                    className={styles['tab-badge--default']}
                  />
                </Space>
              } 
              key="posts"
            >
              {renderPosts()}
            </TabPane>
            <TabPane 
              tab={
                <Space>
                  <StarOutlined />
                  <span>Đánh giá</span>
                  <Badge 
                    count={user.reviews?.length || 0} 
                    showZero 
                    className={styles['tab-badge--default']}
                  />
                </Space>
              } 
              key="reviews"
            >
              {renderReviews()}
            </TabPane>
            <TabPane 
              tab={
                <Space>
                  <MessageOutlined />
                  <span>Bình luận</span>
                  <Badge 
                    count={user.comments?.length || 0} 
                    showZero 
                    className={styles['tab-badge--default']}
                  />
                </Space>
              } 
              key="comments"
            >
              {renderComments()}
            </TabPane>
          </Tabs>
        </Card>

        {/* Ban Info */}
        {user.status === 'banned' && user.ban_info && (
          <Card 
            title={
              <span className={styles['ban-info__title']}>
                ⚠️ Thông tin khóa tài khoản
              </span>
            }
            className={styles['ban-info']}
          >
            <Row gutter={16}>
              <Col span={24} className={styles['ban-info__reason']}>
                <Text strong>Lý do: </Text>
                <Text>{user.ban_info.reason}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Mô tả: </Text>
                <Paragraph className={styles['ban-info__description']}>
                  {user.ban_info.description}
                </Paragraph>
              </Col>
              <Col span={12}>
                <Text strong>Ngày khóa: </Text>
                <Text>{dayjs(user.ban_info.banned_at).format('DD/MM/YYYY HH:mm')}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Hết hạn: </Text>
                <Text>{dayjs(user.ban_info.ban_expires_at).format('DD/MM/YYYY HH:mm')}</Text>
              </Col>
            </Row>
          </Card>
        )}

        {/* ✅ Clean Followers Modal */}
        <Modal
          title={
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              <TeamOutlined style={{ color: '#1890ff' }} />
              <span>Followers ({followCounts.followers || 0})</span>
            </div>
          }
          visible={followersModalVisible}
          onCancel={() => setFollowersModalVisible(false)}
          footer={null}
          width={480}
          className={styles['followers-modal']}
          closeIcon={<CloseOutlined />}
          bodyStyle={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            padding: '16px 0'
          }}
        >
          <Spin spinning={followModalLoading}>
            <div style={{ padding: '0 24px' }}>
              {Array.isArray(followersData) && followersData.length > 0 ? (
                <List
                  dataSource={followersData.filter(item => item && item._id)}
                  renderItem={renderUserItem}
                  locale={{ 
                    emptyText: (
                      <Empty 
                        description="Không có dữ liệu hợp lệ" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ margin: '20px 0' }}
                      />
                    )
                  }}
                  className={styles['followers-modal__list']}
                  style={{ margin: 0 }}
                  split={false}
                />
              ) : (
                <Empty 
                  description={
                    followModalLoading 
                      ? "Đang tải danh sách followers..." 
                      : "Chưa có ai follow người này"
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '40px 0' }}
                />
              )}
            </div>
          </Spin>
        </Modal>

        {/* ✅ Clean Following Modal */}
        <Modal
          title={
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              <TeamOutlined style={{ color: '#1890ff' }} />
              <span>Following ({followCounts.following || 0})</span>
            </div>
          }
          visible={followingModalVisible}
          onCancel={() => setFollowingModalVisible(false)}
          footer={null}
          width={480}
          className={styles['following-modal']}
          closeIcon={<CloseOutlined />}
          bodyStyle={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            padding: '16px 0'
          }}
        >
          <Spin spinning={followModalLoading}>
            <div style={{ padding: '0 24px' }}>
              {Array.isArray(followingData) && followingData.length > 0 ? (
                <List
                  dataSource={followingData.filter(item => item && item._id)}
                  renderItem={renderUserItem}
                  locale={{ 
                    emptyText: (
                      <Empty 
                        description="Không có dữ liệu hợp lệ" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ margin: '20px 0' }}
                      />
                    )
                  }}
                  className={styles['following-modal__list']}
                  style={{ margin: 0 }}
                  split={false}
                />
              ) : (
                <Empty 
                  description={
                    followModalLoading 
                      ? "Đang tải danh sách following..." 
                      : "Người này chưa follow ai"
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '40px 0' }}
                />
              )}
            </div>
          </Spin>
        </Modal>

        {/* ✅ Add Edit Profile Modal */}
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
    </div>
  );
};

export default UserProfile;