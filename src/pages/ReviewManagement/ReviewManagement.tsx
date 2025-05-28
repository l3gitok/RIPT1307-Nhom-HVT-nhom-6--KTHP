import React, { useEffect, useState } from 'react';
import { Tabs, Table, Button, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fetchReviews, updateReviewStatus } from '../../models/review';
import type { Review } from '../../services/ReviewServices';

const statusList = [
	{ key: 'pending', label: 'Chờ duyệt', color: 'orange' },
	{ key: 'approved', label: 'Đã duyệt', color: 'green' },
	{ key: 'rejected', label: 'Từ chối', color: 'red' },
];

const ReviewManagement: React.FC = () => {
	const [activeKey, setActiveKey] = useState('pending');
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(false);

	const loadReviews = async (status: string) => {
		setLoading(true);
		try {
			const { reviews: fetchedReviews } = await fetchReviews({ page: 1, limit: 100 });
			setReviews(fetchedReviews.filter((r) => r.status === status));
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
			await updateReviewStatus(id, 'approved');
			message.success('Duyệt thành công');
			loadReviews(activeKey);
		} catch {
			message.error('Duyệt thất bại');
		}
	};
	const handleReject = async (id: string) => {
		try {
			await updateReviewStatus(id, 'rejected');
			message.success('Từ chối thành công');
			loadReviews(activeKey);
		} catch {
			message.error('Từ chối thất bại');
		}
	};

	const columns: ColumnsType<Review> = [
		{ title: 'ID', dataIndex: '_id', key: '_id' },
		{ title: 'Nội dung', dataIndex: 'content', key: 'content' },
		{ title: 'Rating', dataIndex: 'rating', key: 'rating' },
		{
			title: 'Hình ảnh',
			dataIndex: 'images',
			key: 'images',
			render: (images) =>
				images?.map((url: string, index: number) => (
					<img key={index} src={url} alt='review' style={{ width: 50, marginRight: 8 }} />
				)),
		},
		{
			title: 'Game',
			dataIndex: ['game_id', 'title'],
			key: 'game',
			render: (_, record) => record.game_id?.title || 'Không rõ',
		},
		{
			title: 'Người đánh giá',
			dataIndex: ['author_id', 'profile', 'username'],
			key: 'author',
			render: (_, record) => record.author_id?.profile?.username || 'Không rõ',
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (status) => {
				const statusObj = statusList.find((s) => s.key === status);
				return <Tag color={statusObj?.color}>{statusObj?.label}</Tag>;
			},
		},
		{
			title: 'Hành động',
			key: 'action',
			render: (_, record) =>
				record.status === 'pending' ? (
					<>
						<Button type='primary' onClick={() => handleApprove(record._id)} style={{ marginRight: 8 }}>
							Duyệt
						</Button>
						<Button danger onClick={() => handleReject(record._id)}>
							Từ chối
						</Button>
					</>
				) : null,
		},
	];

	return (
		<Tabs activeKey={activeKey} onChange={setActiveKey}>
			{statusList.map((tab) => (
				<Tabs.TabPane tab={tab.label} key={tab.key}>
					<Table rowKey='_id' columns={columns} dataSource={reviews} loading={loading} pagination={{ pageSize: 10 }} />
				</Tabs.TabPane>
			))}
		</Tabs>
	);
};

export default ReviewManagement;