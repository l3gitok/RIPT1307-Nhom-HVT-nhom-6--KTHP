import React, { useState, useEffect } from 'react';
import {
	Layout,
	Typography,
	Card,
	Row,
	Col,
	Rate,
	Tag,
	Image,
	Spin,
	Select,
	Input,
	Button,
	Space,
	Pagination,
} from 'antd';
import { TrophyOutlined, CalendarOutlined, StarOutlined, FilterOutlined } from '@ant-design/icons';
import GameHubHeader from '@/components/GameHub/Header';
import Navbar from '@/components/GameHub/Navbar';
import useRankingModel from '@/models/ranking';
import { NAV_ITEMS, formatDate, getRankColor } from '@/services/RankingServices';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const BangXepHang: React.FC = () => {
	const [activeNav, setActiveNav] = useState(2);

	const {
		// State
		loading,
		currentPage,
		pageSize,
		filters,

		// Computed values
		uniqueGenres,
		uniquePlatforms,
		filteredAndSortedGames,
		paginatedGames,

		// Actions
		loadGames,
		updateFilters,
		clearFilters,
		setCurrentPage,
	} = useRankingModel();

	useEffect(() => {
		loadGames();
	}, [loadGames]);

	const getRankIcon = (index: number) => {
		if (index < 3) {
			return <TrophyOutlined style={{ color: getRankColor(index), fontSize: '20px' }} />;
		}
		return <span style={{ color: '#8c8c8c', fontSize: '18px', fontWeight: 'bold' }}>#{index + 1}</span>;
	};

	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#FFFCFE' }}>
			{' '}
			<GameHubHeader
				searchText={filters.searchText}
				setSearchText={(text) => updateFilters({ searchText: text })}
				activeNav={activeNav}
				setActiveNav={setActiveNav}
				NAV_ITEMS={NAV_ITEMS}
			/>
			<Navbar
				navItems={NAV_ITEMS}
				activeNav={activeNav}
				setActiveNav={setActiveNav}
				navLinks={{
					0: '/dang-theo-doi',
					1: '/home',
					2: '/bang-xep-hang',
				}}
			/>
			<Content style={{ padding: '24px', backgroundColor: '#FFFCFE', paddingTop: '100px' }}>
				<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
					<div style={{ textAlign: 'center', marginBottom: '32px' }}>
						<Title level={1} style={{ color: '#120C0C', marginBottom: '8px' }}>
							<TrophyOutlined style={{ marginRight: '12px', color: '#FFD700' }} />
							Bảng Xếp Hạng Game
						</Title>
						<Text type='secondary' style={{ fontSize: '16px' }}>
							Khám phá những tựa game được đánh giá cao nhất
						</Text>
					</div>

					{/* Filter and Sort Controls */}
					<Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
						<Row gutter={[16, 16]} align='middle'>
							<Col xs={24} sm={12} md={6}>
								{' '}
								<Search
									placeholder='Tìm kiếm game...'
									value={filters.searchText}
									onChange={(e) => updateFilters({ searchText: e.target.value })}
									style={{ width: '100%' }}
								/>
							</Col>
							<Col xs={24} sm={12} md={4}>
								<Select
									placeholder='Thể loại'
									value={filters.filterGenre}
									onChange={(value) => updateFilters({ filterGenre: value })}
									style={{ width: '100%' }}
									allowClear
								>
									{uniqueGenres.map((genre: string) => (
										<Option key={genre} value={genre}>
											{genre}
										</Option>
									))}
								</Select>
							</Col>
							<Col xs={24} sm={12} md={4}>
								<Select
									placeholder='Nền tảng'
									value={filters.filterPlatform}
									onChange={(value) => updateFilters({ filterPlatform: value })}
									style={{ width: '100%' }}
									allowClear
								>
									{uniquePlatforms.map((platform: string) => (
										<Option key={platform} value={platform}>
											{platform}
										</Option>
									))}
								</Select>
							</Col>
							<Col xs={24} sm={12} md={5}>
								<Select
									value={filters.sortBy}
									onChange={(value) => updateFilters({ sortBy: value })}
									style={{ width: '100%' }}
								>
									<Option value='rating'>Đánh giá cao nhất</Option>
									<Option value='metacritic'>Metacritic cao nhất</Option>
									<Option value='release_date'>Mới nhất</Option>
								</Select>
							</Col>
							<Col xs={24} sm={12} md={5}>
								<Space>
									<Button icon={<FilterOutlined />} onClick={clearFilters}>
										Xóa bộ lọc
									</Button>
									<Text type='secondary'>{filteredAndSortedGames.length} game</Text>
								</Space>
							</Col>
						</Row>
					</Card>

					{loading ? (
						<div style={{ textAlign: 'center', padding: '50px' }}>
							<Spin size='large' />
							<div style={{ marginTop: '16px' }}>
								<Text>Đang tải dữ liệu...</Text>
							</div>
						</div>
					) : filteredAndSortedGames.length === 0 ? (
						<div style={{ textAlign: 'center', padding: '50px' }}>
							<Text type='secondary' style={{ fontSize: '16px' }}>
								Không có dữ liệu game. Vui lòng kiểm tra kết nối API.
							</Text>
							<br />
							<Button type='primary' onClick={loadGames} style={{ marginTop: '16px' }}>
								Thử lại
							</Button>
						</div>
					) : (
						<>
							{' '}
							<Row gutter={[16, 16]}>
								{paginatedGames.map((game: any, index: number) => {
									// Calculate actual rank in the full filtered list
									const actualRank = (currentPage - 1) * pageSize + index;
									return (
										<Col xs={24} sm={24} md={12} lg={8} xl={6} key={game._id}>
											<Card
												hoverable
												style={{
													height: '100%',
													borderRadius: '12px',
													overflow: 'hidden',
													border: actualRank < 3 ? `2px solid ${getRankColor(actualRank)}` : '1px solid #d9d9d9',
													boxShadow: actualRank < 3 ? `0 4px 12px ${getRankColor(actualRank)}30` : undefined,
												}}
												cover={
													<div style={{ position: 'relative' }}>
														<Image
															alt={game.title}
															src={game.cover_url}
															style={{ height: '200px', objectFit: 'cover' }}
														/>
														<div
															style={{
																position: 'absolute',
																top: '8px',
																left: '8px',
																background: 'rgba(0, 0, 0, 0.8)',
																borderRadius: '20px',
																padding: '4px 12px',
																display: 'flex',
																alignItems: 'center',
																gap: '4px',
															}}
														>
															{getRankIcon(actualRank)}
														</div>
														{game.rating && (
															<div
																style={{
																	position: 'absolute',
																	top: '8px',
																	right: '8px',
																	background: 'rgba(0, 0, 0, 0.8)',
																	borderRadius: '12px',
																	padding: '4px 8px',
																	display: 'flex',
																	alignItems: 'center',
																	gap: '4px',
																}}
															>
																<StarOutlined style={{ color: '#FFD700', fontSize: '12px' }} />
																<Text style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
																	{game.rating.toFixed(1)}
																</Text>
															</div>
														)}
													</div>
												}
											>
												<div style={{ padding: '8px 0' }}>
													<Title level={4} style={{ margin: '0 0 8px 0', fontSize: '16px' }} ellipsis={{ rows: 2 }}>
														{game.title}
													</Title>

													<div style={{ marginBottom: '12px' }}>
														<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
															<Rate disabled value={game.rating} count={5} style={{ fontSize: '14px' }} />
															<Text type='secondary' style={{ fontSize: '12px' }}>
																({game.rating?.toFixed(1) || 'N/A'})
															</Text>
														</div>

														{game.metacritic && (
															<div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
																<Text strong style={{ fontSize: '12px' }}>
																	Metacritic:
																</Text>
																<Tag color={game.metacritic >= 80 ? 'green' : game.metacritic >= 60 ? 'yellow' : 'red'}>
																	{game.metacritic}
																</Tag>
															</div>
														)}

														{game.release_date && (
															<div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
																<CalendarOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
																<Text type='secondary' style={{ fontSize: '12px' }}>
																	{formatDate(game.release_date)}
																</Text>
															</div>
														)}
													</div>

													{game.genres && game.genres.length > 0 && (
														<div style={{ marginBottom: '8px' }}>
															{game.genres.slice(0, 2).map((genre: string) => (
																<Tag key={genre} style={{ margin: '0 4px 4px 0', fontSize: '11px' }}>
																	{genre}
																</Tag>
															))}
															{game.genres.length > 2 && (
																<Tag key='more-genres' style={{ margin: '0 4px 4px 0', fontSize: '11px' }}>
																	+{game.genres.length - 2}
																</Tag>
															)}
														</div>
													)}

													{game.platforms && game.platforms.length > 0 && (
														<div>
															<Text type='secondary' style={{ fontSize: '11px' }}>
																Nền tảng: {game.platforms.slice(0, 2).join(', ')}
																{game.platforms.length > 2 && ` +${game.platforms.length - 2}`}
															</Text>
														</div>
													)}
												</div>
											</Card>
										</Col>
									);
								})}
							</Row>
							{/* Pagination */}
							{filteredAndSortedGames.length > pageSize && (
								<div style={{ textAlign: 'center', marginTop: '32px' }}>
									<Pagination
										current={currentPage}
										total={filteredAndSortedGames.length}
										pageSize={pageSize}
										onChange={setCurrentPage}
										showSizeChanger={false}
										showQuickJumper
										showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} game`}
									/>
								</div>
							)}
						</>
					)}
				</div>
			</Content>
		</Layout>
	);
};

export default BangXepHang;
