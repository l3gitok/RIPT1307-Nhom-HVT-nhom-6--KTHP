import React, { useEffect, useState } from 'react';
import {
	Tabs,
	Table,
	Button,
	message,
	Tag,
	Card,
	Space,
	Typography,
	Image,
	Rate,
	Modal,
	Descriptions,
	Tooltip,
	Avatar,
} from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ReviewService } from '@/services';
import type { Review } from '@/services/ReviewServices';

// Hàm loại bỏ thẻ HTML từ nội dung
const removeHtmlTags = (html: string) => {
	if (!html) return '';
	return html.replace(/<\/?[^>]+(>|$)/g, '');
};

const { Title, Text, Paragraph } = Typography;

const statusList = [
	{ key: 'pending', label: 'Chờ duyệt', color: 'orange' },
	{ key: 'approved', label: 'Đã duyệt', color: 'green' },
	{ key: 'rejected', label: 'Từ chối', color: 'red' },
];

const ReviewManagement: React.FC = () => {
	const [activeKey, setActiveKey] = useState('pending');
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedReview, setSelectedReview] = useState<Review | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const loadReviews = async (status: string) => {
		setLoading(true);
		try {
			const response = await ReviewService.getReviews({ status });
			if (response?.data && Array.isArray(response.data.reviews)) {
				setReviews(response.data.reviews);
			}
		} catch (error) {
			console.error('Lỗi khi fetch reviews:', error);
			message.error('Không thể tải danh sách review');
		}
		setLoading(false);
	};

	useEffect(() => {
		loadReviews(activeKey);
	}, [activeKey]);
	const handleApprove = async (id: string) => {
		try {
			await ReviewService.updateReviewStatus(id, 'approved');
			message.success('Duyệt review thành công');
			loadReviews(activeKey);
		} catch {
			message.error('Duyệt review thất bại');
		}
	};

	const handleReject = async (id: string) => {
		try {
			await ReviewService.updateReviewStatus(id, 'rejected');
			message.success('Từ chối review thành công');
			loadReviews(activeKey);
		} catch {
			message.error('Từ chối review thất bại');
		}
	};

	const showReviewDetail = (review: Review) => {
		setSelectedReview(review);
		setIsModalVisible(true);
	};

	const formatDate = (dateInput: string | Date) => {
		return new Date(dateInput).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const columns: ColumnsType<Review> = [
		{
			title: 'Game',
			key: 'game',
			width: 250,
			render: (_, record) => (
				<Space>
					<Avatar src={record.game_id?.cover_url} size={40} shape='square' />
					<div>
						<Text strong>{record.game_id?.title || 'Không rõ'}</Text>
						<br />
						<Text type='secondary' style={{ fontSize: '12px' }}>
							ID: {record.game_id?._id?.slice(-8)}
						</Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Người đánh giá',
			key: 'author',
			width: 200,
			render: (_, record) => (
				<Space>
					<Avatar
						src={
							'avatar_url' in (record.author_id?.profile || {})
								? (record.author_id?.profile as any).avatar_url
								: undefined
						}
						size={32}
					>
						{record.author_id?.profile?.username?.charAt(0)?.toUpperCase()}
					</Avatar>
					<div>
						<Text strong>{record.author_id?.profile?.username || 'Ẩn danh'}</Text>
						<br />
						<Text type='secondary' style={{ fontSize: '12px' }}>
							{record.author_id?.email}
						</Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Đánh giá',
			key: 'rating',
			width: 120,
			render: (_, record) => (
				<div style={{ textAlign: 'center' }}>
					<Rate disabled defaultValue={record.rating} style={{ fontSize: '14px' }} />
					<br />
					<Text strong style={{ color: '#faad14' }}>
						{record.rating}/5
					</Text>
				</div>
			),
		},
		{
			title: 'Nội dung',
			dataIndex: 'content',
			key: 'content',
			ellipsis: {
				showTitle: false,
			},
			render: (content) => (
				<Tooltip placement='topLeft' title={content}>
					<Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ margin: 0, maxWidth: 300 }}>
						{content}
					</Paragraph>
				</Tooltip>
			),
		},
		{
			title: 'Hình ảnh',
			dataIndex: 'images',
			key: 'images',
			width: 120,
			render: (images) => (
				<Space size={4}>
					{images?.slice(0, 3).map((url: string, index: number) => (
						<Image
							key={index}
							src={url}
							alt='review'
							width={30}
							height={30}
							style={{ objectFit: 'cover', borderRadius: '4px' }}
						/>
					))}
					{images?.length > 3 && (
						<Text type='secondary' style={{ fontSize: '12px' }}>
							+{images.length - 3}
						</Text>
					)}
				</Space>
			),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			render: (status) => {
				const statusObj = statusList.find((s) => s.key === status);
				return <Tag color={statusObj?.color}>{statusObj?.label}</Tag>;
			},
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'created_at',
			key: 'created_at',
			width: 150,
			render: (date) => (
				<Text type='secondary' style={{ fontSize: '12px' }}>
					{formatDate(date)}
				</Text>
			),
		},
		{
			title: 'Hành động',
			key: 'action',
			width: 180,
			fixed: 'right',
			render: (_, record) => (
				<Space>
					<Tooltip title='Xem chi tiết'>
						<Button type='default' icon={<EyeOutlined />} size='small' onClick={() => showReviewDetail(record)} />
					</Tooltip>
					{record.status === 'pending' && (
						<>
							<Tooltip title='Duyệt'>
								<Button
									type='primary'
									icon={<CheckOutlined />}
									size='small'
									onClick={() => handleApprove(record._id)}
								/>
							</Tooltip>
							<Tooltip title='Từ chối'>
								<Button danger icon={<CloseOutlined />} size='small' onClick={() => handleReject(record._id)} />
							</Tooltip>
						</>
					)}
				</Space>
			),
		},
	];

	const renderTabContent = (status: string) => {
		const currentStatusInfo = statusList.find((s) => s.key === status);
		const filteredReviews = reviews.filter((r) => r.status === status);

		return (
			<Card>
				<div style={{ marginBottom: 16 }}>
					<Title level={4}>
						<Tag color={currentStatusInfo?.color}>{currentStatusInfo?.label}</Tag>({filteredReviews.length} reviews)
					</Title>
				</div>

				<Table
					rowKey='_id'
					columns={columns}
					dataSource={filteredReviews}
					loading={loading}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} reviews`,
					}}
					scroll={{ x: 1200 }}
					size='middle'
				/>
			</Card>
		);
	};

	return (
		<div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
			<Card style={{ marginBottom: 24 }}>
				<Title level={2}>Quản lý Reviews</Title>
				<Text type='secondary'>Quản lý và duyệt các đánh giá game từ người dùng</Text>
			</Card>

			<Tabs activeKey={activeKey} onChange={setActiveKey} type='card' size='large'>
				{statusList.map((tab) => (
					<Tabs.TabPane tab={tab.label} key={tab.key}>
						{renderTabContent(tab.key)}
					</Tabs.TabPane>
				))}
			</Tabs>

			{/* Modal chi tiết review */}
			<Modal
				title='Chi tiết Review'
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={[
					<Button key='close' onClick={() => setIsModalVisible(false)}>
						Đóng
					</Button>,
					...(selectedReview?.status === 'pending'
						? [
								<Button
									key='reject'
									danger
									onClick={() => {
										handleReject(selectedReview._id);
										setIsModalVisible(false);
									}}
								>
									Từ chối
								</Button>,
								<Button
									key='approve'
									type='primary'
									onClick={() => {
										handleApprove(selectedReview._id);
										setIsModalVisible(false);
									}}
								>
									Duyệt
								</Button>,
						  ]
						: []),
				]}
				width={800}
			>
				{selectedReview && (
					<div>
						<Descriptions bordered column={2} style={{ marginBottom: 16 }}>
							<Descriptions.Item label='Game' span={2}>
								<Space>
									<Avatar src={selectedReview.game_id?.cover_url} size={40} shape='square' />
									<Text strong>{selectedReview.game_id?.title}</Text>
								</Space>
							</Descriptions.Item>

							<Descriptions.Item label='Người đánh giá'>
								<Space>
									<Avatar
										src={
											'avatar_url' in (selectedReview.author_id?.profile || {})
												? (selectedReview.author_id?.profile as any).avatar_url
												: undefined
										}
										size={24}
									>
										{selectedReview.author_id?.profile?.username?.charAt(0)?.toUpperCase()}
									</Avatar>
									{selectedReview.author_id?.profile?.username}
								</Space>
							</Descriptions.Item>

							<Descriptions.Item label='Email'>{selectedReview.author_id?.email}</Descriptions.Item>

							<Descriptions.Item label='Đánh giá'>
								<Rate disabled defaultValue={selectedReview.rating} />
								<Text style={{ marginLeft: 8 }}>{selectedReview.rating}/5</Text>
							</Descriptions.Item>

							<Descriptions.Item label='Trạng thái'>
								<Tag color={statusList.find((s) => s.key === selectedReview.status)?.color}>
									{statusList.find((s) => s.key === selectedReview.status)?.label}
								</Tag>
							</Descriptions.Item>

							<Descriptions.Item label='Ngày tạo' span={2}>
								{formatDate(selectedReview.created_at)}
							</Descriptions.Item>
						</Descriptions>{' '}
						<Title level={5}>Nội dung đánh giá:</Title>
						<Card size='small' style={{ marginBottom: 16 }}>
							<Paragraph>{removeHtmlTags(selectedReview.content)}</Paragraph>
						</Card>
						{selectedReview.images && selectedReview.images.length > 0 && (
							<>
								<Title level={5}>Hình ảnh đính kèm:</Title>
								<div
									style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}
								>
									<Image.PreviewGroup>
										<Space direction='vertical' align='center' style={{ width: '100%' }}>
											{selectedReview.images.map((url: string, index: number) => (
												<Image
													key={`image-${url}-${Date.now()}`}
													src={url}
													alt={`review-image-${index}`}
													style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: '8px' }}
												/>
											))}
										</Space>
									</Image.PreviewGroup>
								</div>
							</>
						)}
					</div>
				)}
			</Modal>
		</div>
	);
};

export default ReviewManagement;
