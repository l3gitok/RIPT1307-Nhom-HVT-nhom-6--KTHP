import React, { useEffect, useState } from 'react';
import { Table, Button, Input, message, Modal, Form, Card, Space, Typography, Tag, Avatar, Row, Col, Statistic } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CameraOutlined } from '@ant-design/icons';
import { fetchGames, fetchGameById, createGame, updateGame, deleteGame } from '../../models/game';
import { Game } from '../../services/GameServices';
import dayjs from 'dayjs';
import { StarFilled } from '@ant-design/icons';
import GameDetailForm from './GameDetailForm';
import './GameManager.less';

const { Title, Text } = Typography;

const GameManager: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const totalGames = localStorage.getItem('totalGames') ? parseInt(localStorage.getItem('totalGames')!, 10) : 0;
    
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
            title: 'Game',
            key: 'game',
            render: (record: Game) => (
                <div className="game-info">
                    <Avatar
                        src={record.cover_url}
                        size={60}
                        shape="square"
                        icon={<CameraOutlined />}
                        className="game-avatar"
                    />
                    <div className="game-details">
                        <Text strong className="game-title">{record.title}</Text>
                        <div className="game-meta">
                            <Text type="secondary" className="game-date">
                                {record.release_date ? dayjs(record.release_date).format('DD/MM/YYYY') : 'N/A'}
                            </Text>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Thể loại',
            dataIndex: 'genres',
            key: 'genres',
            render: (genres: string[]) => (
                <div className="genres-container">
                    {genres?.slice(0, 2).map((genre, index) => (
                        <Tag key={index} color="blue" className="genre-tag">
                            {genre}
                        </Tag>
                    ))}
                    {genres?.length > 2 && (
                        <Tag color="default">+{genres.length - 2}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Nền tảng',
            dataIndex: 'platforms',
            key: 'platforms',
            render: (platforms: string[]) => (
                <div className="platforms-container">
                    {platforms?.slice(0, 2).map((platform, index) => (
                        <Tag key={index} color="green" className="platform-tag">
                            {platform}
                        </Tag>
                    ))}
                    {platforms?.length > 2 && (
                        <Tag color="default">+{platforms.length - 2}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Đánh giá',
            key: 'rating',
            render: (record: Game) => (
                <div className="rating-container">
                    <div className="rating-item">
                        <StarFilled style={{ color: '#faad14' }} />
                        <Text strong>{record.rating ?? 0}/5</Text>
                    </div>
                    {record.metacritic && (
                        <div className="metacritic-item">
                            <Text type="secondary">MC: {record.metacritic}</Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Game) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => showDetail(record)}
                        className="action-btn view-btn"
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="action-btn edit-btn"
                        title="Chỉnh sửa"
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record)}
                        className="action-btn delete-btn"
                        title="Xóa"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="game-manager">
            {/* Header */}
            <Card className="header-card">
                <Row gutter={24} align="middle">
                    <Col flex="auto">
                        <Title level={2} className="page-title">
							<CameraOutlined style={{ color: '#ffffff' }} /> 
							<span style={{ color: '#ffffff' }}>Quản lý Game</span>
						</Title>
                    </Col>
                    <Col>
                        <Statistic
                            title="Tổng số game"
                            value={totalGames}
                            prefix={<CameraOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Controls */}
            <Card className="controls-card">
                <Row gutter={16} align="middle">
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            size="large"
                            className="add-btn"
                        >
                            Thêm game
                        </Button>
                    </Col>
                    <Col flex="auto">
                       <Input.Search
							placeholder="Tìm kiếm game..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							allowClear
							size="large"
							className="search-input"
							prefix={<SearchOutlined />}
							style={{ borderRadius: '30px' }}
						/>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card className="table-card">
                <Table
                    rowKey="_id"
                    dataSource={games}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} games`,
                    }}
                    className="games-table"
                />
            </Card>

            {/* Form thêm/sửa game */}
            <Modal
                visible={formVisible}
                title={
                    <div className="modal-title">
                        <CameraOutlined />
                        {formMode === 'add' ? 'Thêm game mới' : 'Chỉnh sửa game'}
                    </div>
                }
                onCancel={() => setFormVisible(false)}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
                width={800}
                className="game-form-modal"
            >
                <Form form={form} layout="vertical" onFinish={handleFormFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="title" label="Tên game" rules={[{ required: true }]}>
                                <Input placeholder="Nhập tên game" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="release_date" label="Ngày phát hành">
                                <Input placeholder="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả về game" />
                    </Form.Item>

                    <Form.Item name="cover_url" label="Ảnh bìa">
                        <Input placeholder="URL ảnh bìa" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="genres" label="Thể loại">
                                <Input placeholder="Action, RPG, Adventure..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="platforms" label="Nền tảng">
                                <Input placeholder="PC, PS5, Xbox..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="rating" label="Rating">
                                <Input type="number" min={0} max={5} step={0.1} placeholder="0-5" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="metacritic" label="Metacritic">
                                <Input type="number" min={0} max={100} placeholder="0-100" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="esrb_rating" label="ESRB">
                                <Input placeholder="E, T, M..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="developer" label="Developer">
                                <Input placeholder="Nhà phát triển" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="publisher" label="Publisher">
                                <Input placeholder="Nhà phát hành" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="rawg_id" label="RAWG ID">
                                <Input placeholder="ID từ RAWG" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="slug" label="Slug">
                                <Input placeholder="URL slug" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <GameDetailForm visible={detailVisible} game={selectedGame} onClose={() => setDetailVisible(false)} />
        </div>
    );
};

export default GameManager;