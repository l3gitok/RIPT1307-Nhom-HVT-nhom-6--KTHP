import React, { useState, useEffect } from 'react';
import { 
  List, 
  Avatar, 
  Button, 
  Input, 
  Space, 
  Typography, 
  message, 
  Popconfirm,
  Spin,
  Alert,
  Tooltip
} from 'antd';
import {
  UserOutlined, 
  SendOutlined, 
  DeleteOutlined,
  CheckCircleFilled,
  LikeOutlined,
  LikeFilled,
  ExclamationCircleOutlined,
  MessageOutlined,
  CloseCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { 
  getComments, 
  createComment, 
  deleteComment, 
  toggleCommentLike,
  checkCommentLike,
  countCommentsInTree
} from '../../../models/comment';
import { Comment } from '../../../services/CommentServices';
import { useHistory } from 'umi'; // ✅ Add for navigation
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;
const { TextArea } = Input;

interface CommentSectionProps {
  reviewId: string;
  currentUser: any;
  commentsCount: number;
  onCommentsCountChange: (count: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  reviewId,
  currentUser,
  commentsCount,
  onCommentsCountChange
}) => {
  const history = useHistory(); // ✅ Add for navigation
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentLikes, setCommentLikes] = useState<{[key: string]: boolean}>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<{[key: string]: number}>({});
  const [likingComments, setLikingComments] = useState<{[key: string]: boolean}>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<string | null>(null);

  // ✅ Debug: Track comments changes with detailed logging
  useEffect(() => {
    console.log('Comments updated:', comments);
    console.log('Comments length:', comments.length);
    // ✅ Debug each comment's author info
    comments.forEach((comment, index) => {
      console.log(`Comment ${index}:`, {
        id: comment._id,
        content: comment.content?.substring(0, 50) + '...',
        author_id: comment.author_id,
        author: comment.author,
        authorType: typeof comment.author,
        hasProfile: comment.author?.profile ? 'yes' : 'no'
      });
    });
  }, [comments]);

  // ✅ Auto load comments when section is shown
  useEffect(() => {
    if (showComments) {
      console.log('Loading comments because showComments is true');
      loadComments();
    }
  }, [showComments, reviewId]);

  useEffect(() => {
    if (comments.length > 0 && currentUser) {
      loadCommentLikesRecursive(comments);
    }
  }, [currentUser, comments]);

  const loadComments = async () => {
    if (!reviewId) {
      console.error('No reviewId provided');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Loading comments for reviewId:', reviewId);
      const commentsData = await getComments(reviewId);
      console.log('Raw comments data received:', commentsData);
      
      const validComments = Array.isArray(commentsData) ? commentsData : [];
      setComments(validComments);

      const totalCount = countCommentsInTree(validComments);
      console.log('Total comment count calculated:', totalCount);
      onCommentsCountChange(totalCount);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Không thể tải bình luận');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentLikesRecursive = async (commentList: Comment[]) => {
    if (!currentUser || !commentList) return;
    
    for (const comment of commentList) {
      try {
        setCommentLikeCounts(prev => ({
          ...prev,
          [comment._id]: comment.likes_count || 0
        }));

        const liked = await checkCommentLike(comment._id);
        setCommentLikes(prev => ({ ...prev, [comment._id]: liked }));
      } catch (error) {
        console.error(`Error checking comment like status for ${comment._id}:`, error);
      }

      if (comment.replies && comment.replies.length > 0) {
        await loadCommentLikesRecursive(comment.replies);
      }
    }
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để bình luận');
      return;
    }

    const contentToSubmit = parentId ? (replyContent[parentId] || '').trim() : newComment.trim();

    if (!contentToSubmit) {
      message.warning(parentId ? 'Vui lòng nhập nội dung trả lời' : 'Vui lòng nhập nội dung bình luận');
      return;
    }

    if (contentToSubmit.length > 1000) {
      message.warning('Bình luận không được vượt quá 1000 ký tự');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('Creating comment with data:', {
        reviewId,
        content: contentToSubmit,
        parentId,
        currentUser: currentUser._id
      });

      const comment = await createComment(reviewId, contentToSubmit, parentId);
      
      console.log('Create comment response:', comment);
      
      message.success(parentId ? 'Đã gửi trả lời' : 'Bình luận đã được thêm');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadComments();
      
      if (parentId) {
        setReplyContent(prev => ({ ...prev, [parentId]: '' }));
        setActiveReplyBox(null);
      } else {
        setNewComment('');
      }
      
    } catch (error: any) {
      console.error('Submit comment error:', error);
      const backendErrorMessage = error.response?.data?.message;
      const errorStatus = error.response?.status;
      
      if (errorStatus === 400) {
        setError('Dữ liệu bình luận không hợp lệ. Vui lòng kiểm tra lại.');
        message.error('Dữ liệu không hợp lệ');
      } else if (errorStatus === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        message.error('Phiên đăng nhập đã hết hạn');
      } else if (errorStatus === 403) {
        setError('Bạn không có quyền thực hiện hành động này.');
        message.error('Không có quyền truy cập');
      } else if (errorStatus === 404) {
        setError('Không tìm thấy bài viết để bình luận.');
        message.error('Không tìm thấy bài viết');
      } else if (errorStatus === 500) {
        setError('Lỗi máy chủ. Vui lòng thử lại sau.');
        message.error('Lỗi máy chủ');
      } else if (error.message?.toLowerCase().includes('network error')) {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
        message.error('Lỗi kết nối mạng');
      } else {
        const errorMessage = backendErrorMessage || error.message || 'Không thể tạo bình luận';
        setError(errorMessage);
        message.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const success = await deleteComment(commentId);
      if (success) {
        console.log('Comment deleted, reloading comments...');
        await loadComments();
        message.success('Bình luận đã được xóa');
      } else {
        message.error('Không thể xóa bình luận');
      }
    } catch (error) {
      message.error('Không thể xóa bình luận');
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để thích bình luận');
      return;
    }

    setLikingComments(prev => ({ ...prev, [commentId]: true }));
    
    try {
      const result = await toggleCommentLike(commentId);
      setCommentLikes(prev => ({ ...prev, [commentId]: result.liked }));
      setCommentLikeCounts(prev => ({ ...prev, [commentId]: result.likesCount }));
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      message.error(error.response?.data?.message || 'Không thể thích/bỏ thích bình luận. Vui lòng thử lại.');
    } finally {
      setLikingComments(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReplyInputChange = (commentId: string, value: string) => {
    setReplyContent(prev => ({ ...prev, [commentId]: value }));
  };

  const toggleReplyBox = (commentId: string) => {
    setActiveReplyBox(prev => (prev === commentId ? null : commentId));
    if (activeReplyBox !== commentId) {
      setReplyContent(prev => ({ ...prev, [commentId]: '' }));
    }
  };

  // ✅ Navigate to user profile
  const navigateToUserProfile = (userId: string) => {
    if (userId && userId !== 'unknown') {
      history.push(`/profile/${userId}`);
    }
  };

  // ✅ Enhanced recursive comment rendering with better user info handling
  const renderCommentItem = (comment: Comment, level: number = 0, parentAuthor?: string) => {
    if (!comment) return null;

    // ✅ Enhanced user info extraction with detailed debugging
    const getUserInfo = (comment: Comment) => {
      console.log('Processing comment for user info:', {
        commentId: comment._id,
        author_id: comment.author_id,
        author: comment.author,
        authorKeys: comment.author ? Object.keys(comment.author) : 'no author'
      });

      // ✅ Handle different author data structures
      let author = comment.author;
      let authorId = comment.author_id;
      
      // If author is not populated, try to use author_id as string
      if (!author && typeof comment.author_id === 'string') {
        authorId = comment.author_id;
        author = {} as typeof author;
      }
      
      // If author_id is an object (populated), use it as author
      if (typeof comment.author_id === 'object' && comment.author_id !== null) {
        author = comment.author_id as any;
        authorId = author._id;
      }

      // ✅ Extract user information with multiple fallback strategies
      let username = 'Người dùng';
      let avatar_url = undefined;
      let is_verified = false;
      let userId = authorId;

      if (author && typeof author === 'object') {
        // Strategy 1: Use profile data if available
        if (author.profile) {
          username = author.profile.username || 
                    (author.profile as any)?.name || 
                    username;
          avatar_url = author.profile.avatar_url || 
                      (author.profile as any)?.picture;
        }
        
        // Strategy 2: Use direct fields if profile is empty
        if (!username || username === 'Người dùng') {
          username = (author as any).username || 
                    (author as any).name || 
                    (author.email ? author.email.split('@')[0] : '');
        }
        
        // Strategy 3: Use email as fallback
        if ((!username || username === 'Người dùng') && author.email) {
          username = author.email.split('@')[0];
        }
        
        // Get verification status
        is_verified = Boolean(author.is_verified);
        
        // Get user ID
        userId = author._id || authorId;
        
        // Get avatar
        if (!avatar_url) {
          avatar_url = (author as any)?.avatar_url || (author as any)?.avatar || (author as any)?.picture;
        }
      }

      // ✅ Final fallback using IDs
      if (!username || username === 'Người dùng') {
        if (userId && typeof userId === 'string') {
          username = `User${userId.slice(-4)}`;
        } else {
          username = `User${Math.random().toString().slice(-4)}`;
        }
      }

      const result = {
        username,
        avatar_url,
        is_verified,
        displayName: username,
        userId: userId || 'unknown'
      };

      console.log('Extracted user info:', result);
      return result;
    };

    const userInfo = getUserInfo(comment);
    const isOwnComment = currentUser?._id === comment.author_id || 
                        currentUser?._id === userInfo.userId;
    const maxNestingLevel = 8; // ✅ Increased nesting levels for deeper conversations
    
    // ✅ Calculate indentation with visual hierarchy
    const indentationStyle = {
      marginLeft: level > 0 ? `${Math.min(level, maxNestingLevel) * 20}px` : '0px',
      borderLeft: level > 0 ? '2px solid #e8e8e8' : 'none',
      paddingLeft: level > 0 ? '16px' : '0px'
    };

    return (
      <div key={comment._id} style={indentationStyle}>
        <div
          style={{ 
            padding: '12px 0', 
            borderBottom: level === 0 ? '1px solid #f5f5f5' : 'none',
            backgroundColor: level % 2 === 1 ? '#fafafa' : 'transparent',
            borderRadius: level > 0 ? '8px' : '0px',
            margin: level > 0 ? '6px 0' : '0px'
          }}
        >
          {/* ✅ Comment Header with User Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* ✅ User Avatar with Navigation */}
            <Tooltip title={`${userInfo.displayName}${userInfo.is_verified ? ' (Đã xác minh)' : ''} - Bấm để xem profile`}>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 2,
                  flexShrink: 0,
                  border: userInfo.is_verified ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onClick={() => navigateToUserProfile(userInfo.userId)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                <Avatar
                  size={level > 2 ? 28 : level > 0 ? 32 : 40}
                  src={userInfo.avatar_url}
                  icon={<UserOutlined />}
                  style={{
                    background: 'transparent',
                  }}
                />
              </span>
            </Tooltip>

            {/* ✅ Comment Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* ✅ User name and metadata */}
              <div style={{ marginBottom: '6px' }}>
                <Space size="small" align="baseline" wrap>
                  <span
                    style={{
                      fontSize: level > 1 ? '13px' : '14px',
                      color: '#262626',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onClick={() => navigateToUserProfile(userInfo.userId)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#1890ff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#262626';
                    }}
                  >
                    <Text strong style={{ color: 'inherit', fontSize: 'inherit' }}>
                      {userInfo.displayName}
                    </Text>
                  </span>
                  
                  {userInfo.is_verified && (
                    <Tooltip title="Tài khoản đã xác minh">
                      <CheckCircleFilled 
                        style={{ 
                          color: '#1890ff', 
                          fontSize: '12px'
                        }} 
                      />
                    </Tooltip>
                  )}

                  {/* ✅ Reply indicator */}
                  {parentAuthor && level > 0 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <Text code style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#f0f0f0' }}>
                        trả lời @{parentAuthor}
                      </Text>
                    </Text>
                  )}

                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    • {dayjs(comment.created_at).fromNow()}
                  </Text>

                  {/* ✅ Comment level indicator for deep nesting */}
                  {level > 2 && (
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      #{level + 1}
                    </Text>
                  )}
                </Space>
              </div>

              {/* ✅ Comment content with better formatting */}
              <div style={{ 
                fontSize: level > 1 ? '13px' : '14px', 
                lineHeight: '1.6', 
                color: '#333', 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginBottom: '10px',
                padding: '8px 0',
                backgroundColor: level > 0 ? '#ffffff' : 'transparent',
                borderRadius: '6px',
                border: level > 0 ? '1px solid #f0f0f0' : 'none',
                paddingLeft: level > 0 ? '12px' : '0px',
                paddingRight: level > 0 ? '12px' : '0px'
              }}>
                {comment.content}
              </div>

              {/* ✅ Comment Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* Like Button */}
                <Button
                  type="text"
                  size="small"
                  loading={likingComments[comment._id]}
                  onClick={() => handleToggleCommentLike(comment._id)}
                  disabled={!currentUser}
                  style={{ 
                    height: '28px',
                    padding: '0 8px',
                    color: commentLikes[comment._id] ? '#1890ff' : '#8c8c8c',
                    fontSize: '12px',
                    borderRadius: '14px'
                  }}
                >
                  <Space size={4}>
                    {commentLikes[comment._id] ? <LikeFilled /> : <LikeOutlined />}
                    <span>{commentLikeCounts[comment._id] || 0}</span>
                  </Space>
                </Button>

                {/* Reply Button */}
                {level < maxNestingLevel && currentUser && (
                  <Button
                    type="text"
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => toggleReplyBox(comment._id)}
                    style={{ 
                      height: '28px',
                      padding: '0 8px',
                      color: activeReplyBox === comment._id ? '#1890ff' : '#8c8c8c',
                      fontSize: '12px',
                      borderRadius: '14px'
                    }}
                  >
                    Trả lời
                  </Button>
                )}

                {/* Delete Button */}
                {isOwnComment && (
                  <Popconfirm
                    title={
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Xóa bình luận?</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          Bạn có chắc muốn xóa bình luận này không? Hành động này không thể hoàn tác.
                        </div>
                      </div>
                    }
                    onConfirm={() => handleDeleteComment(comment._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    placement="topRight"
                  >
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<DeleteOutlined />} 
                      danger
                      style={{ 
                        height: '28px',
                        padding: '0 8px',
                        fontSize: '12px',
                        borderRadius: '14px'
                      }}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                )}

                {/* Reply count indicator */}
                {comment.replies && comment.replies.length > 0 && (
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    📝 {comment.replies.length} trả lời
                  </Text>
                )}
              </div>

              {/* ✅ Reply Input Box with increased size */}
              {activeReplyBox === comment._id && currentUser && level < maxNestingLevel && (
                <div style={{ 
                  marginTop: '16px', 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'flex-start',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <Avatar
                    size={28}
                    src={currentUser.profile?.avatar_url}
                    icon={<UserOutlined />}
                    style={{ flexShrink: 0, marginTop: '4px' }}
                  />
                  <TextArea
                    value={replyContent[comment._id] || ''}
                    onChange={(e) => handleReplyInputChange(comment._id, e.target.value)}
                    placeholder={`Trả lời ${userInfo.displayName}...`}
                    autoSize={{ minRows: 2, maxRows: 8 }} // ✅ Increased from 3 to 8 rows
                    maxLength={1000}
                    style={{ 
                      flex: 1, 
                      borderRadius: '8px', 
                      fontSize: '13px',
                      border: '1px solid #d9d9d9'
                    }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment(comment._id);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<SendOutlined />}
                      loading={submitting && activeReplyBox === comment._id}
                      onClick={() => handleSubmitComment(comment._id)}
                      disabled={!(replyContent[comment._id] || '').trim()}
                      style={{ fontSize: '12px', borderRadius: '6px' }}
                    >
                      Gửi
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseCircleOutlined />}
                      onClick={() => toggleReplyBox(comment._id)}
                      style={{ fontSize: '12px' }}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Recursive rendering of replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ 
            marginTop: '8px',
            position: 'relative'
          }}>
            {comment.replies.map((reply, index) => (
              <div key={reply._id || index}>
                {renderCommentItem(reply, level + 1, userInfo.username)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleRefreshComments = () => {
    console.log('Manual refresh triggered');
    loadComments();
  };

  return (
    <div style={{ marginTop: '12px' }}>
      {/* ✅ Comment toggle button */}
      <Button
        type="text"
        size="small"
        onClick={() => setShowComments(!showComments)}
        style={{ 
          padding: '4px 8px', 
          height: 'auto',
          fontSize: '13px',
          color: '#666'
        }}
      >
        <Space size={4}>
          <MessageOutlined />
          <span>
            {commentsCount > 0 ? `${commentsCount} bình luận` : 'Bình luận'}
          </span>
        </Space>
      </Button>

      {showComments && (
        <div style={{ 
          marginTop: '12px', 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          {error && (
            <Alert
              message={error}
              type="warning"
              icon={<ExclamationCircleOutlined />}
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: '12px' }}
              action={
                <Button size="small" onClick={handleRefreshComments}>
                  Thử lại
                </Button>
              }
            />
          )}

          {/* ✅ Development debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              marginBottom: '12px', 
              fontSize: '12px', 
              color: '#666',
              padding: '8px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #e0e0e0'
            }}>
              Debug: ReviewId: {reviewId}, Comments: {comments.length}
              <Button size="small" onClick={handleRefreshComments} style={{ marginLeft: 8 }}>
                Refresh
              </Button>
            </div>
          )}

          {/* ✅ Comment input for authenticated users with increased size */}
          {currentUser && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'flex-start',
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <Avatar
                  src={currentUser.profile?.avatar_url}
                  icon={<UserOutlined />}
                  size={36}
                  style={{ flexShrink: 0 }}
                />
                <TextArea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  autoSize={{ minRows: 3, maxRows: 10 }} // ✅ Increased from 6 to 10 rows
                  maxLength={1000}
                  style={{ 
                    flex: 1, 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: 'none',
                    resize: 'none'
                  }}
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    handleSubmitComment();
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={submitting && !activeReplyBox}
                  onClick={() => handleSubmitComment()}
                  style={{ 
                    alignSelf: 'flex-end',
                    borderRadius: '8px'
                  }}
                  disabled={!newComment.trim()}
                >
                  Gửi
                </Button>
              </div>
              {newComment && (
                <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {newComment.length}/1000 ký tự • Shift + Enter để xuống dòng
                </Text>
              )}
            </div>
          )}

          {/* ✅ Comments list with improved loading state */}
          <Spin spinning={loading} tip="Đang tải bình luận...">
            <div style={{ 
              backgroundColor: '#fff',
              borderRadius: '8px',
              minHeight: loading ? '100px' : 'auto'
            }}>
              {comments.length > 0 ? (
                <div style={{ padding: '12px 0' }}>
                  {comments.map((comment, index) => (
                    <div key={comment._id || index}>
                      {renderCommentItem(comment, 0)}
                    </div>
                  ))}
                </div>
              ) : (
                !loading && !error && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#999'
                  }}>
                    <MessageOutlined style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                    <Text type="secondary">Chưa có bình luận nào</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Hãy là người đầu tiên bình luận!
                    </Text>
                  </div>
                )
              )}
            </div>
          </Spin>
        </div>
      )}
    </div>
  );
};

export default CommentSection;