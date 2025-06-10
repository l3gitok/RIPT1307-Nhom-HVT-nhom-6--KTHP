import { Button, Modal, Row, Table, Tag, Col, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import dayjs from 'dayjs';
import axios from 'axios'; // Import axios for consistency
import type { User } from '../../services/UserServices'; // Import User type
import BanUserForm, { BanUserFormValues } from './BanUserForm';

// API Endpoints
const API_USER_BANS_BASE_URL = 'https://gamehubapi-test.onrender.com/api/user-bans';

const UserManager = () => {
	// Removed unused states: setRow, isEdit, setVisible, setIsEdit, visible
	// Assuming these are for a generic edit modal not used here.
	// The `loading` from user model is for getDataUser, which is fine.
	const { data, getDataUser, loading: tableLoading } = useModel('user');
	const [searchUsername, setSearchUsername] = useState('');
	const [searchEmail, setSearchEmail] = useState('');
	const [banModalVisible, setBanModalVisible] = useState(false);
	const [banLoading, setBanLoading] = useState(false);
	const [currentRecord, setCurrentRecord] = useState<User | null>(null);

	useEffect(() => {
		getDataUser();
	}, []);

	const filteredData = data?.filter((item: User) => {
		const matchUsername = searchUsername
			? (item.profile?.username || '').toLowerCase().includes(searchUsername.toLowerCase())
			: true;
		const matchEmail = searchEmail ? (item.email || '').toLowerCase().includes(searchEmail.toLowerCase()) : true;
		return matchUsername && matchEmail;
	});

	const handleBanClick = (record: User) => {
		setCurrentRecord(record);
		setBanModalVisible(true);
	};

	const handleBanSubmit = async (values: BanUserFormValues) => {
		setBanLoading(true);
		const token = localStorage.getItem('accessToken');
		if (!token) {
			message.error('Bạn chưa đăng nhập!');
			setBanLoading(false);
			return;
		}
		try {
			// Use axios for consistency
			const response = await axios.post(
				`${API_USER_BANS_BASE_URL}/${currentRecord?._id}/ban`,
				values,
				{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			// Assuming API returns data in response.data
			if (response.data.success) { // Adjust based on your API response structure
				message.success('Đã khóa user!');
				setBanModalVisible(false);
				getDataUser(); // Refresh data
			} else {
				message.error(response.data.message || 'Cập nhật trạng thái thất bại!');
			}
		} catch (error: any) {
			message.error(error.response?.data?.message || 'Có lỗi xảy ra khi khóa user!');
			console.error('Error banning user:', error);
		} finally {
				setBanLoading(false);
		}
	};

	const handleUnban = async (record: User) => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			message.error('Bạn chưa đăng nhập!');
			return;
		}
		try {
			const response = await axios.post(
				`${API_USER_BANS_BASE_URL}/${record._id}/unban`,
				{}, // Empty body for unban
				{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data.success) { // Adjust based on your API response structure
				message.success('Đã mở khóa user!');
				getDataUser(); // Refresh data
			} else {
				message.error(response.data.message || 'Cập nhật trạng thái thất bại!');
			}
		} catch (error: any) {
			message.error(error.response?.data?.message || 'Có lỗi xảy ra khi mở khóa user!');
			console.error('Error unbanning user:', error);
		}
	};

	const columns: ColumnsType<User> = [
		{
			title: 'ID',
			dataIndex: '_id',
			key: '_id',
			width: 180,
			render: (text: string) => <span>{text.slice(0, 8)}</span>,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: 200,
		},
		{
			title: 'Username',
			dataIndex: ['profile', 'username'],
			key: 'username',
			width: 180,
		},
		{
			title: 'Role',
			dataIndex: 'role',
			key: 'role',
			width: 120,
			render: (role: string) => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role.toUpperCase()}</Tag>,
		},
		{
			title: 'Verified',
			dataIndex: 'is_verified',
			key: 'verified',
			width: 120,
			render: (verified: boolean) => <Tag color={verified ? 'green' : 'default'}>{verified ? 'Yes' : 'No'}</Tag>,
		},
		{
			title: 'Created At',
			dataIndex: 'created_at',
			key: 'created_at',
			width: 180,
			render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 120,
			render: (status: string) => (
				<Tag color={status === 'banned' ? 'volcano' : 'green'}>{status === 'banned' ? 'Banned' : 'Active'}</Tag>
			),
		},
		{
			title: 'Action',
			key: 'action',
			width: 200,
			render: (_text, record: User) => { // Added _text for unused first param
				const isBanned = record.status === 'banned';
				return isBanned ? (
					<Button danger type='primary' onClick={() => handleUnban(record)}>
						Unban
					</Button>
				) : (
					<Button type='primary' onClick={() => handleBanClick(record)}>
						Ban
					</Button>
				);
			},
		},
	];

	return (
		<div>
			<Row gutter={16} style={{ marginBottom: 16 }}>
				<Col>
					<Input.Search
						allowClear
						placeholder='Tìm theo Username'
						value={searchUsername}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchUsername(e.target.value)}
						style={{ width: 200 }}
					/>
				</Col>
				<Col>
					<Input.Search
						allowClear
						placeholder='Tìm theo Email'
						value={searchEmail}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchEmail(e.target.value)}
						style={{ width: 200 }}
					/>
				</Col>
			</Row>

			<Table rowKey='_id' dataSource={filteredData} columns={columns} loading={tableLoading} />

			<Modal
				destroyOnClose
				footer={null}
				title='Ban User'
				visible={banModalVisible}
				onCancel={() => setBanModalVisible(false)}
			>
				<BanUserForm onFinish={handleBanSubmit} loading={banLoading} />
			</Modal>
		</div>
	);
};

export default UserManager;
