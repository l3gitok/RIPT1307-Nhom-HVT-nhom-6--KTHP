import React, { useState, useEffect } from 'react';
import {
	Table,
	Button,
	Select,
	Input,
	Space,
	Tag,
	Modal,
	Card,
	Row,
	Col,
	Statistic,
	message,
	Avatar,
	Typography,
	Pagination,
	Tooltip,
} from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import { fetchReports, updateReportStatus, getReportStats } from '../../models/report';
import type { UserReport } from '../../services/ReportServices';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface ReportStats {
	stats: { id: string; count: number }[];
	total_resolved: number;
	total_reports: number;
	total_banned_users: number;
}

const ReportManagement: React.FC = () => {
	const [reports, setReports] = useState<UserReport[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
		totalPages: 1,
	});
	const [filters, setFilters] = useState({
		status: '',
		reported_user_id: '',
	});
	const [stats, setStats] = useState<ReportStats | null>(null);
	const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [adminNote, setAdminNote] = useState('');
	const [actionLoading, setActionLoading] = useState(false);

	// Load reports
	const loadReports = async (page = 1) => {
		try {
			setLoading(true);
			const { reports: data, pagination: paginationData } = await fetchReports({
				page,
				limit: pagination.pageSize,
				...filters,
			});

			setReports(data);
			setPagination((prev) => ({
				...prev,
				current: page,
				total: paginationData.total,
				totalPages: paginationData.totalPages,
			}));
		} catch (error) {
			message.error('Không thể tải danh sách report');
			console.error('Load reports error:', error);
		} finally {
			setLoading(false);
		}
	};

	// Load stats
	const loadStats = async () => {
		try {
			const statsData = await getReportStats();
			setStats(statsData);
		} catch (error) {
			console.error('Load stats error:', error);
		}
	};

	useEffect(() => {
		loadReports();
		loadStats();
	}, [filters]);

	// Handle status update
	const handleStatusUpdate = async (reportId: string, status: string) => {
		try {
			setActionLoading(true);
			await updateReportStatus(reportId, status as any, adminNote);
			message.success(`Đã ${status === 'resolved' ? 'chấp nhận' : 'từ chối'} report`);
			setModalVisible(false);
			setSelectedReport(null);
			setAdminNote('');
			loadReports(pagination.current);
			loadStats();
		} catch (error) {
			message.error('Không thể cập nhật trạng thái report');
			console.error('Update status error:', error);
		} finally {
			setActionLoading(false);
		}
	};

	// Open detail modal
	const openDetailModal = (report: UserReport) => {
		setSelectedReport(report);
		setAdminNote(report.admin_note || '');
		setModalVisible(true);
	};

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'orange';
			case 'resolved':
				return 'green';
			case 'rejected':
				return 'red';
			default:
				return 'default';
		}
	};

	// Get reason text
	const getReasonText = (reason: string) => {
		switch (reason) {
			case 'spam':
				return 'Spam';
			case 'inappropriate':
				return 'Nội dung không phù hợp';
			case 'harassment':
				return 'Quấy rối';
			case 'fake_account':
				return 'Tài khoản giả mạo';
			case 'other':
				return 'Khác';
			default:
				return reason;
		}
	};

	// Table columns
	const columns = [
		{
			title: 'Người bị báo cáo',
			dataIndex: ['reported_user_id'],
			key: 'reported_user',
			render: (user: any) => (
				<Space>
					<Avatar src={user?.profile?.avatar_url} icon={<UserOutlined />} size='small' />
					<Text>{user?.profile?.username || 'N/A'}</Text>
				</Space>
			),
		},
		{
			title: 'Người báo cáo',
			dataIndex: ['reporter_id'],
			key: 'reporter',
			render: (user: any) => (
				<Space>
					<Avatar src={user?.profile?.avatar_url} icon={<UserOutlined />} size='small' />
					<Text>{user?.profile?.username || 'N/A'}</Text>
				</Space>
			),
		},
		{
			title: 'Lý do',
			dataIndex: 'reason',
			key: 'reason',
			render: (reason: string) => <Tag color='blue'>{getReasonText(reason)}</Tag>,
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			render: (text: string) => (
				<Tooltip title={text}>
					<Text ellipsis style={{ maxWidth: 200 }}>
						{text || 'Không có mô tả'}
					</Text>
				</Tooltip>
			),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (status: string) => (
				<Tag color={getStatusColor(status)}>
					{status === 'pending' ? 'Chờ xử lý' : status === 'resolved' ? 'Đã giải quyết' : 'Đã từ chối'}
				</Tag>
			),
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'created_at',
			key: 'created_at',
			render: (date: string) => <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>,
		},
		{
			title: 'Hành động',
			key: 'actions',
			render: (_: any, record: UserReport) => (
				<Space>
					<Tooltip title='Xem chi tiết'>
						<Button icon={<EyeOutlined />} size='small' onClick={() => openDetailModal(record)} />
					</Tooltip>
					{record.status === 'pending' && (
						<>
							<Tooltip title='Chấp nhận'>
								<Button
									icon={<CheckOutlined />}
									size='small'
									type='primary'
									onClick={() => {
										setSelectedReport(record);
										Modal.confirm({
											title: 'Xác nhận chấp nhận report',
											content: 'Hành động này sẽ ban user bị báo cáo. Bạn có chắc chắn?',
											onOk: () => handleStatusUpdate(record._id, 'resolved'),
										});
									}}
								/>
							</Tooltip>
							<Tooltip title='Từ chối'>
								<Button
									icon={<CloseOutlined />}
									size='small'
									danger
									onClick={() => {
										setSelectedReport(record);
										setModalVisible(true);
									}}
								/>
							</Tooltip>
						</>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: '24px' }}>
			{/* Stats Cards */}
			{stats && (
				<Row gutter={16} style={{ marginBottom: 24 }}>
					<Col span={6}>
						<Card>
							<Statistic title='Tổng số report' value={stats.total_reports} prefix={<ExclamationCircleOutlined />} />
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title='Chờ xử lý'
								value={stats.stats.find((s) => s.id === 'pending')?.count || 0}
								valueStyle={{ color: '#faad14' }}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title='Đã giải quyết'
								value={stats.stats.find((s) => s.id === 'resolved')?.count || 0}
								valueStyle={{ color: '#52c41a' }}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic title='User bị ban' value={stats.total_banned_users} valueStyle={{ color: '#ff4d4f' }} />
						</Card>
					</Col>
				</Row>
			)}

			{/* Filters */}
			<Card style={{ marginBottom: 24 }}>
				<Space>
					<Select
						placeholder='Lọc theo trạng thái'
						style={{ width: 150 }}
						value={filters.status}
						onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
						allowClear
					>
						<Option value='pending'>Chờ xử lý</Option>
						<Option value='resolved'>Đã giải quyết</Option>
						<Option value='rejected'>Đã từ chối</Option>
					</Select>
					<Button onClick={() => loadReports(1)}>Làm mới</Button>
				</Space>
			</Card>

			{/* Reports Table */}
			<Card>
				<Table
					columns={columns}
					dataSource={reports}
					rowKey='_id'
					loading={loading}
					pagination={false}
					scroll={{ x: 1000 }}
				/>

				<div style={{ marginTop: 16, textAlign: 'center' }}>
					<Pagination
						current={pagination.current}
						total={pagination.total}
						pageSize={pagination.pageSize}
						showSizeChanger
						showQuickJumper
						showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} reports`}
						onChange={(page, pageSize) => {
							setPagination((prev) => ({ ...prev, pageSize: pageSize || 10 }));
							loadReports(page);
						}}
					/>
				</div>
			</Card>

			{/* Detail Modal */}
			<Modal
				title='Chi tiết Report'
				visible={modalVisible}
				onCancel={() => {
					setModalVisible(false);
					setSelectedReport(null);
					setAdminNote('');
				}}
				footer={[
					<Button key='cancel' onClick={() => setModalVisible(false)}>
						Hủy
					</Button>,
					...(selectedReport?.status === 'pending'
						? [
								<Button
									key='reject'
									danger
									loading={actionLoading}
									onClick={() => handleStatusUpdate(selectedReport._id, 'rejected')}
								>
									Từ chối
								</Button>,
								<Button
									key='resolve'
									type='primary'
									loading={actionLoading}
									onClick={() => handleStatusUpdate(selectedReport._id, 'resolved')}
								>
									Chấp nhận & Ban User
								</Button>,
						  ]
						: []),
				]}
				width={600}
			>
				{selectedReport && (
					<div>
						<Row gutter={16}>
							<Col span={12}>
								<Text strong>Người bị báo cáo:</Text>
								<div style={{ marginBottom: 16 }}>
									<Space>
										<Avatar src={selectedReport.reported_user_id?.profile?.avatar_url} icon={<UserOutlined />} />
										<Text>{selectedReport.reported_user_id?.profile?.username}</Text>
									</Space>
								</div>
							</Col>
							<Col span={12}>
								<Text strong>Người báo cáo:</Text>
								<div style={{ marginBottom: 16 }}>
									<Space>
										<Avatar src={selectedReport.reporter_id?.profile?.avatar_url} icon={<UserOutlined />} />
										<Text>{selectedReport.reporter_id?.profile?.username}</Text>
									</Space>
								</div>
							</Col>
						</Row>

						<div style={{ marginBottom: 16 }}>
							<Text strong>Lý do:</Text>
							<div>
								<Tag color='blue'>{getReasonText(selectedReport.reason)}</Tag>
							</div>
						</div>

						<div style={{ marginBottom: 16 }}>
							<Text strong>Mô tả:</Text>
							<Paragraph>{selectedReport.description || 'Không có mô tả'}</Paragraph>
						</div>

						{selectedReport.evidence && selectedReport.evidence.length > 0 && (
							<div style={{ marginBottom: 16 }}>
								<Text strong>Bằng chứng:</Text>
								{selectedReport.evidence.map((item: any, index: number) => (
									<div key={index} style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
										<Text type='secondary'>Loại: {item.type}</Text>
										<br />
										<Text>{item.content}</Text>
									</div>
								))}
							</div>
						)}

						<div style={{ marginBottom: 16 }}>
							<Text strong>Trạng thái:</Text>
							<div>
								<Tag color={getStatusColor(selectedReport.status)}>
									{selectedReport.status === 'pending'
										? 'Chờ xử lý'
										: selectedReport.status === 'resolved'
										? 'Đã giải quyết'
										: 'Đã từ chối'}
								</Tag>
							</div>
						</div>

						<div style={{ marginBottom: 16 }}>
							<Text strong>Ghi chú admin:</Text>
							<TextArea
								rows={3}
								value={adminNote}
								onChange={(e) => setAdminNote(e.target.value)}
								placeholder='Nhập ghi chú...'
								disabled={selectedReport.status !== 'pending'}
							/>
						</div>

						{selectedReport.resolved_by && (
							<div style={{ marginBottom: 16 }}>
								<Text strong>Được xử lý bởi:</Text>
								<div>
									<Text>{selectedReport.resolved_by?.profile?.username}</Text>
									<br />
									<Text type='secondary'>{new Date(selectedReport.resolved_at!).toLocaleString('vi-VN')}</Text>
								</div>
							</div>
						)}
					</div>
				)}
			</Modal>
		</div>
	);
};

export default ReportManagement;
