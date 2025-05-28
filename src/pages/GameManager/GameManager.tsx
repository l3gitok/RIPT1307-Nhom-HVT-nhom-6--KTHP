import React, { useEffect, useState } from 'react';
import { Table, Button, Input, message, Modal, Form } from 'antd';
import { fetchGames, fetchGameById, createGame, updateGame, deleteGame } from '../../models/game';
import { Game } from '../../services/GameServices';
import dayjs from 'dayjs';
import { StarFilled } from '@ant-design/icons';
import GameDetailForm from './GameDetailForm';

const GameManager: React.FC = () => {
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [detailVisible, setDetailVisible] = useState(false);
	const [selectedGame, setSelectedGame] = useState<Game | null>(null);

	// Thêm state cho form thêm/sửa
	const [formVisible, setFormVisible] = useState(false);
	const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
	const [form] = Form.useForm();

	const loadGames = async () => {
		setLoading(true);
		try {
			const { games: fetchedGames } = await fetchGames({ search });
			setGames(fetchedGames);
		} catch (err) {
			message.error('Lỗi khi tải danh sách game');
		}
		setLoading(false);
	};

	useEffect(() => {
		loadGames();
		// eslint-disable-next-line
	}, [search]);

	const showDetail = async (game: Game) => {
		try {
			const detail = await fetchGameById(game._id);
			setSelectedGame(detail);
			setDetailVisible(true);
		} catch {
			message.error('Không thể tải chi tiết game');
		}
	};

	// Thêm game
	const handleAdd = () => {
		setFormMode('add');
		setSelectedGame(null);
		form.resetFields();
		setFormVisible(true);
	};

	// Sửa game
	const handleEdit = (game: Game) => {
		setFormMode('edit');
		setSelectedGame(game);
		form.setFieldsValue({
			...game,
			genres: game.genres?.join(', '),
			platforms: game.platforms?.join(', '),
			developer: game.developer?.join(', '),
			publisher: game.publisher?.join(', '),
		});
		setFormVisible(true);
	};

	// Xoá game
	const handleDelete = async (game: Game) => {
		Modal.confirm({
			title: 'Xác nhận xoá',
			content: `Bạn có chắc muốn xoá game "${game.title}"?`,
			onOk: async () => {
				try {
					await deleteGame(game._id);
					message.success('Đã xoá game');
					loadGames();
				} catch {
					message.error('Xoá game thất bại');
				}
			},
		});
	};

	// Xử lý submit form thêm/sửa
	const handleFormFinish = async (values: any) => {
		// Chuyển các trường chuỗi về mảng
		const data = {
			...values,
			genres: values.genres ? values.genres.split(',').map((s: string) => s.trim()) : [],
			platforms: values.platforms ? values.platforms.split(',').map((s: string) => s.trim()) : [],
			developer: values.developer ? values.developer.split(',').map((s: string) => s.trim()) : [],
			publisher: values.publisher ? values.publisher.split(',').map((s: string) => s.trim()) : [],
		};
		try {
			if (formMode === 'add') {
				await createGame(data);
				message.success('Thêm game thành công');
			} else if (formMode === 'edit' && selectedGame) {
				await updateGame(selectedGame._id, data);
				message.success('Cập nhật game thành công');
			}
			setFormVisible(false);
			loadGames();
		} catch {
			message.error('Lưu game thất bại');
		}
	};

	const columns = [
		{
			title: 'Ảnh bìa',
			dataIndex: 'cover_url',
			key: 'cover_url',
			render: (cover_url: string) => (
				<img src={cover_url} alt='cover_url' style={{ width: 50, height: 50, objectFit: 'cover' }} />
			),
		},
		{ title: 'Tên game', dataIndex: 'title', key: 'title' },
		{ title: 'Thể loại', dataIndex: 'genres', key: 'genres', render: (genres: string[]) => genres?.join(', ') },
		{
			title: 'Nền tảng',
			dataIndex: 'platforms',
			key: 'platforms',
			render: (platforms: string[]) => platforms?.join(', '),
		},
		{
			title: 'Ngày phát hành',
			dataIndex: 'release_date',
			key: 'release_date',
			render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : ''),
		},
		{
			title: 'Rating',
			dataIndex: 'rating',
			key: 'rating',
			render: (rating: number) => (
				<span>
					{rating ?? 0}/5 <StarFilled style={{ color: '#faad14' }} />
				</span>
			),
		},
		{
			title: 'Metacritic',
			dataIndex: 'metacritic',
			key: 'metacritic',
			render: (metacritic: number) => metacritic ?? '-',
		},
		{
			title: 'Hành động',
			key: 'action',
			render: (_: any, record: Game) => (
				<>
					<Button onClick={() => showDetail(record)}>Xem chi tiết</Button>
					<Button style={{ marginLeft: 8 }} onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button style={{ marginLeft: 8 }} danger onClick={() => handleDelete(record)}>
						Xoá
					</Button>
				</>
			),
		},
	];

	return (
		<div>
			<h2>Quản lý Game</h2>
			<Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
				Thêm game
			</Button>
			<Input.Search
				placeholder='Tìm kiếm game'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				style={{ width: 300, marginBottom: 16, marginLeft: 16 }}
				allowClear
			/>
			<Table rowKey='_id' dataSource={games} columns={columns} loading={loading} pagination={{ pageSize: 10 }} />

			{/* Form thêm/sửa game */}
			<Modal
				visible={formVisible}
				title={formMode === 'add' ? 'Thêm game' : 'Sửa game'}
				onCancel={() => setFormVisible(false)}
				onOk={() => form.submit()}
				okText='Lưu'
			>
				<Form form={form} layout='vertical' onFinish={handleFormFinish}>
					<Form.Item name='title' label='Tên game' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='description' label='Mô tả'>
						<Input.TextArea />
					</Form.Item>
					<Form.Item name='cover_url' label='Ảnh bìa'>
						<Input />
					</Form.Item>
					<Form.Item name='release_date' label='Ngày phát hành'>
						<Input />
					</Form.Item>
					<Form.Item name='genres' label='Thể loại'>
						<Input placeholder='Cách nhau bởi dấu phẩy' />
					</Form.Item>
					<Form.Item name='platforms' label='Nền tảng'>
						<Input placeholder='Cách nhau bởi dấu phẩy' />
					</Form.Item>
					<Form.Item name='rating' label='Rating'>
						<Input type='number' min={0} max={5} />
					</Form.Item>
					<Form.Item name='metacritic' label='Metacritic'>
						<Input type='number' />
					</Form.Item>
					<Form.Item name='esrb_rating' label='ESRB'>
						<Input />
					</Form.Item>
					<Form.Item name='developer' label='Developer'>
						<Input placeholder='Cách nhau bởi dấu phẩy' />
					</Form.Item>
					<Form.Item name='publisher' label='Publisher'>
						<Input placeholder='Cách nhau bởi dấu phẩy' />
					</Form.Item>
					<Form.Item name='rawg_id' label='RAWG ID'>
						<Input />
					</Form.Item>
					<Form.Item name='slug' label='Slug'>
						<Input />
					</Form.Item>
				</Form>
			</Modal>

			<GameDetailForm visible={detailVisible} game={selectedGame} onClose={() => setDetailVisible(false)} />
		</div>
	);
};

export default GameManager;
