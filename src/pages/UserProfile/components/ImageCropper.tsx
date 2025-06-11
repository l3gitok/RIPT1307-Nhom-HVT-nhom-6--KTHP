import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { 
  Crop, 
  PixelCrop, 
  centerCrop, 
  makeAspectCrop,
  convertToPixelCrop 
} from 'react-image-crop';
import { Modal, Button, Space, Slider, Typography, Row, Col } from 'antd';
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  SaveOutlined,
  CloseOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './index.less';

const { Text } = Typography;

interface ImageCropperProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (croppedImage: File) => void;
  imageUrl: string;
  aspectRatio?: number; // For avatar: 1, for banner: 16/9 or 3/1
  cropShape?: 'rect' | 'round';
  title?: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  visible,
  onCancel,
  onConfirm,
  imageUrl,
  aspectRatio,
  cropShape = 'rect',
  title = 'Cắt ảnh'
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    let initialCrop: Crop;
    
    if (aspectRatio) {
      initialCrop = makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        aspectRatio,
        width,
        height,
      );
    } else {
      initialCrop = {
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      };
    }

    // Ensure unit is '%' for centerCrop
    setCrop(centerCrop({ ...initialCrop, unit: '%' }, width, height));
  }, [aspectRatio]);

  // Generate cropped image
  const getCroppedImg = useCallback(async (): Promise<File | null> => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    
    if (!image || !canvas || !completedCrop) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );
    
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    // Apply transformations
    ctx.save();
    
    // Handle rotation
    if (rotate !== 0) {
      const centerX = offscreen.width / 2;
      const centerY = offscreen.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }
    
    // Handle scaling
    ctx.scale(scale, scale);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );

    ctx.restore();

    const blob = await offscreen.convertToBlob({
      type: 'image/jpeg',
      quality: 0.9,
    });

    return new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
  }, [completedCrop, scale, rotate]);

  // Handle confirm
  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const croppedFile = await getCroppedImg();
      if (croppedFile) {
        onConfirm(croppedFile);
        onCancel();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Reset states when modal closes
  const handleCancel = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setScale(1);
    setRotate(0);
    onCancel();
  };

  return (
    <Modal
      title={
        <div className={styles['crop-modal-title']}>
          <SaveOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>{title}</span>
        </div>
      }
      visible={visible}
      onCancel={handleCancel}
      width={800}
      className={styles['image-cropper-modal']}
      closeIcon={<CloseOutlined />}
      footer={
        <div className={styles['crop-footer']}>
          <Space size="large">
            <Button size="large" onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={processing}
              onClick={handleConfirm}
              disabled={!completedCrop}
            >
              Áp dụng
            </Button>
          </Space>
        </div>
      }
      destroyOnClose
    >
      <div className={styles['crop-container']}>
        {/* Crop Area */}
        <div className={styles['crop-area']}>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(convertToPixelCrop(c, imgRef.current?.width || 0, imgRef.current?.height || 0))}
            aspect={aspectRatio}
            circularCrop={cropShape === 'round'}
            className={styles['react-crop']}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageUrl}
              style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                maxWidth: '100%',
                maxHeight: '400px',
              }}
              onLoad={onImageLoad}
              className={styles['crop-image']}
            />
          </ReactCrop>
        </div>

        {/* Controls */}
        <div className={styles['crop-controls']}>
          <Row gutter={[24, 16]}>
            {/* Scale Control */}
            <Col span={24}>
              <div className={styles['control-group']}>
                <Text strong className={styles['control-label']}>
                  <ZoomInOutlined /> Phóng to/thu nhỏ
                </Text>
                <div className={styles['slider-container']}>
                  <ZoomOutOutlined className={styles['slider-icon']} />
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={scale}
                    onChange={setScale}
                    className={styles['control-slider']}
                  />
                  <ZoomInOutlined className={styles['slider-icon']} />
                  <Text className={styles['slider-value']}>{(scale * 100).toFixed(0)}%</Text>
                </div>
              </div>
            </Col>

            {/* Rotation Control */}
            <Col span={24}>
              <div className={styles['control-group']}>
                <Text strong className={styles['control-label']}>
                  <RotateLeftOutlined /> Xoay ảnh
                </Text>
                <div className={styles['rotation-controls']}>
                  <Space size="small">
                    <Button
                      icon={<RotateLeftOutlined />}
                      onClick={() => setRotate(prev => prev - 90)}
                      size="small"
                    >
                      Trái 90°
                    </Button>
                    <Button
                      icon={<RotateRightOutlined />}
                      onClick={() => setRotate(prev => prev + 90)}
                      size="small"
                    >
                      Phải 90°
                    </Button>
                    <Text className={styles['rotation-value']}>{rotate}°</Text>
                  </Space>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Hidden canvas for processing */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </Modal>
  );
};

export default ImageCropper;