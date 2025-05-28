import { Button, Modal, Row, Table, Tag, Col, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import dayjs from 'dayjs';
// import FormUser from './FormUser'; // XÓA DÒNG NÀY
import BanUserForm, { BanUserFormValues } from './BanUserForm';

const UserManager = () => {
	const { data, getDataUser, setRow, isEdit, setVisible, setIsEdit, visible } = useModel('user');
	const [searchId, setSearchId] = useState('');
	const [searchEmail, setSearchEmail] = useState('');
	const [banModalVisible, setBanModalVisible] = useState(false);
	const [banLoading, setBanLoading] = useState(false);
	const [currentRecord, setCurrentRecord] = useState<any>(null);

	useEffect(() => {
		getDataUser();
	}, []);

	const filteredData = data?.filter((item: any) => {
		const matchId = searchId ? (item._id || '').toLowerCase().includes(searchId.toLowerCase()) : true;
		const matchEmail = searchEmail ? (item.email || '').toLowerCase().includes(searchEmail.toLowerCase()) : true;
		return matchId && matchEmail;
	});

	const handleBanClick = (record: any) => {
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
			const response = await fetch(`https://gamehubapi-test.onrender.com/api/user-bans/${currentRecord._id}/ban`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const errorData = await response.json();
				message.error(errorData.message || 'Cập nhật trạng thái thất bại!');
				setBanLoading(false);
				return;
			}

			message.success('Đã khóa user!');
			setBanModalVisible(false);
			getDataUser();
		} catch (error) {
			message.error('Có lỗi xảy ra!');
			console.error('Error:', error);
		}
		setBanLoading(false);
	};

	const handleUnban = async (record: any) => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			message.error('Bạn chưa đăng nhập!');
			return;
		}
		try {
			const response = await fetch(`https://gamehubapi-test.onrender.com/api/user-bans/${record._id}/unban`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				message.error(errorData.message || 'Cập nhật trạng thái thất bại!');
				return;
			}

			message.success('Đã mở khóa user!');
			getDataUser();
		} catch (error) {
			message.error('Có lỗi xảy ra!');
			console.error('Error:', error);
		}
	};

	const columns: ColumnsType<any> = [
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
			render: (record) => {
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
						placeholder='Tìm theo ID'
						value={searchId}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchId(e.target.value)}
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

			<Table rowKey='_id' dataSource={filteredData} columns={columns} />

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
