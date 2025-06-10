import React, { useState, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Avatar,
  message,
  Space,
  Divider,
  Typography,
  Progress,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  PictureOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  ScissorOutlined
} from '@ant-design/icons';
import type { User, EditProfileFormValues } from '../../../services/UserServices';
import ImageCropper from './ImageCropper';
import styles from './index.less';

const { Text } = Typography;

interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (updatedUser: User) => void;
  user: User;
  loading: boolean;
  uploadLoading: boolean;
  onUpdateProfile: (data: EditProfileFormValues) => Promise<User | null>;
  onUploadImage: (file: File, type: 'avatar' | 'cover') => Promise<string | null>;
  onDeleteImage?: (publicId: string) => Promise<boolean>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  user,
  loading,
  uploadLoading,
  onUpdateProfile,
  onUploadImage,
  onDeleteImage
}) => {
  const [form] = Form.useForm();
  const [previewAvatar, setPreviewAvatar] = useState<string>(user.profile?.avatar_url || '');
  const [previewCover, setPreviewCover] = useState<string>(user.profile?.cover_url || '');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // ✅ Cropper states
  const [cropperVisible, setCropperVisible] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ✅ Handle form submit
  const handleSubmit = async (values: EditProfileFormValues) => {
    try {
      const profileData = {
        username: values.username,
        avatar_url: previewAvatar,
        cover_url: previewCover
      };

      const updatedUser = await onUpdateProfile(profileData);
      if (updatedUser) {
        onSuccess(updatedUser);
        onCancel();
        form.resetFields();
        setPreviewAvatar('');
        setPreviewCover('');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // ✅ Validate image file
  const validateImageFile = (file: File, maxSizeMB: number = 5): boolean => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh (JPG, PNG, JPEG)!');
      return false;
    }

    const isValidSize = file.size / 1024 / 1024 < maxSizeMB;
    if (!isValidSize) {
      message.error(`Ảnh phải nhỏ hơn ${maxSizeMB}MB!`);
      return false;
    }

    return true;
  };

  // ✅ Handle file selection for cropping
  const handleFileSelect = (file: File, type: 'avatar' | 'cover') => {
    if (!validateImageFile(file, type === 'avatar' ? 2 : 5)) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageUrl(reader.result as string);
      setCropType(type);
      setCropperVisible(true);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Handle cropped image upload
  const handleCroppedImage = async (croppedFile: File) => {
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const imageUrl = await onUploadImage(croppedFile, cropType);
      if (imageUrl) {
        if (cropType === 'avatar') {
          setPreviewAvatar(imageUrl);
        } else {
          setPreviewCover(imageUrl);
        }
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
        message.success(`Upload ${cropType === 'avatar' ? 'avatar' : 'ảnh bìa'} thành công!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  // ✅ Remove functions
  const handleRemoveAvatar = () => {
    setPreviewAvatar('');
    message.success('Đã xóa avatar');
  };

  const handleRemoveCover = () => {
    setPreviewCover('');
    message.success('Đã xóa ảnh bìa');
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        username: user.profile?.username || '',
      });
      setPreviewAvatar(user.profile?.avatar_url || '');
      setPreviewCover(user.profile?.cover_url || '');
      setUploadProgress(0);
    }
  }, [visible, user, form]);

  return (
    <>
      <Modal
        title={
          <div className={styles['modal-title']}>
            <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>Chỉnh sửa profile</span>
          </div>
        }
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        className={styles['edit-profile-modal']}
        closeIcon={<CloseOutlined />}
        destroyOnClose
      >
        <div className={styles['modal-content']}>
          {/* ✅ Upload Progress Bar */}
          {uploadProgress > 0 && (
            <div className={styles['upload-progress']}>
              <Progress 
                percent={uploadProgress} 
                status={uploadProgress === 100 ? 'success' : 'active'}
                showInfo={false}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
                Đang upload... {uploadProgress}%
              </Text>
            </div>
          )}

          {/* Cover Image Section */}
          <div className={styles['cover-section']}>
            <div className={styles['section-header']}>
              <Text strong className={styles['section-title']}>
                <PictureOutlined /> Ảnh bìa
              </Text>
              <Text type="secondary" className={styles['section-subtitle']}>
                Khuyến nghị: 1200x400px, tỷ lệ 3:1
              </Text>
            </div>
            
            <div 
              className={styles['cover-preview']}
              style={{
                backgroundImage: previewCover 
                  ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${previewCover})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<ScissorOutlined />}
                  loading={uploadLoading}
                  onClick={() => coverInputRef.current?.click()}
                  className={styles['cover-upload-btn']}
                >
                  {previewCover ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}
                </Button>
                {previewCover && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveCover}
                    className={styles['cover-remove-btn']}
                  >
                    Xóa
                  </Button>
                )}
              </Space>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'cover');
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* Avatar Section */}
          <div className={styles['avatar-section']}>
            <div className={styles['section-header']}>
              <Text strong className={styles['section-title']}>
                <UserOutlined /> Avatar
              </Text>
              <Text type="secondary" className={styles['section-subtitle']}>
                Khuyến nghị: 400x400px, tỷ lệ 1:1
              </Text>
            </div>

            <Row gutter={24} align="middle">
              <Col>
                <div className={styles['avatar-container']}>
                  <Avatar
                    size={120}
                    src={previewAvatar}
                    icon={<UserOutlined />}
                    className={styles['avatar-preview']}
                  />
                  <div className={styles['avatar-actions']}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<ScissorOutlined />}
                      loading={uploadLoading}
                      onClick={() => avatarInputRef.current?.click()}
                      className={styles['avatar-upload-btn']}
                      title="Đổi avatar"
                    />
                    {previewAvatar && (
                      <Button
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                        onClick={handleRemoveAvatar}
                        className={styles['avatar-remove-btn']}
                        title="Xóa avatar"
                      />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, 'avatar');
                      e.target.value = '';
                    }}
                  />
                </div>
              </Col>
              <Col flex={1}>
                <div className={styles['avatar-info']}>
                  <Text className={styles['avatar-description']}>
                    Chọn ảnh để làm avatar của bạn. Bạn có thể cắt và điều chỉnh ảnh theo ý muốn.
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '32px 0' }} />

          {/* Form Section */}
          <div className={styles['form-section']}>
            <div className={styles['section-header']}>
              <Text strong className={styles['section-title']}>
                <EditOutlined /> Thông tin cá nhân
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className={styles['edit-form']}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <Text strong style={{ fontSize: '14px' }}>
                        Tên người dùng
                      </Text>
                    }
                    name="username"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên người dùng!' },
                      { min: 2, message: 'Tên người dùng phải có ít nhất 2 ký tự!' },
                      { max: 30, message: 'Tên người dùng không được vượt quá 30 ký tự!' },
                      { 
                        pattern: /^[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF\s]+$/,
                        message: 'Tên người dùng chỉ được chứa chữ cái, số, dấu cách và dấu gạch dưới!'
                      }
                    ]}
                  >
                    <Input
                      placeholder="Nhập tên người dùng"
                      maxLength={30}
                      showCount
                      size="large"
                      disabled={uploadLoading}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={
                      <Text strong style={{ fontSize: '14px' }}>
                        Email (chỉ đọc)
                      </Text>
                    }
                  >
                    <Input
                      value={user.email}
                      disabled
                      size="large"
                      style={{ backgroundColor: '#f5f5f5', color: '#999' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                <Row justify="end">
                  <Col>
                    <Space size="middle">
                      <Button
                        size="large"
                        onClick={onCancel}
                        disabled={loading || uploadLoading}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={loading}
                        disabled={uploadLoading}
                      >
                        Lưu thay đổi
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>

      {/* ✅ Image Cropper Modal */}
      <ImageCropper
        visible={cropperVisible}
        onCancel={() => setCropperVisible(false)}
        onConfirm={handleCroppedImage}
        imageUrl={tempImageUrl}
        aspectRatio={cropType === 'avatar' ? 1 : 3}
        cropShape={cropType === 'avatar' ? 'round' : 'rect'}
        title={cropType === 'avatar' ? 'Cắt Avatar' : 'Cắt Ảnh Bìa'}
      />
    </>
  );
};

export default EditProfileModal;