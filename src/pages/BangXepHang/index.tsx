import React, { useState, useEffect, useMemo } from 'react';
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
	message,
	Select,
	Input,
	Button,
	Space,
	Pagination,
} from 'antd';
import { TrophyOutlined, CalendarOutlined, StarOutlined, FilterOutlined } from '@ant-design/icons';
import GameHubHeader from '@/components/GameHub/Header';
import Navbar from '@/components/GameHub/Navbar';
// Import fallback data
import fallbackGames from '@/data/games.json';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface Game {
	_id: string;
	title: string;
	description: string;
	cover_url: string;
	release_date: string;
	rating: number;
	metacritic: number;
	esrb_rating: string;
	genres: string[];
	platforms: string[];
	slug: string;
}

const NAV_ITEMS = [
	{ label: 'Đang theo dõi', key: 0 },
	{ label: 'Trang chủ', key: 1 },
	{ label: 'Bảng Xếp Hạng', key: 2 },
];

const BangXepHang: React.FC = () => {
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchText, setSearchText] = useState('');
	const [activeNav, setActiveNav] = useState(2);
	const [sortBy, setSortBy] = useState<'rating' | 'metacritic' | 'release_date'>('rating');
	const [filterGenre, setFilterGenre] = useState<string>('');
	const [filterPlatform, setFilterPlatform] = useState<string>('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);
	const fetchGames = async () => {
		try {
			setLoading(true);
			console.log('Đang gọi API...');

			const response = await fetch('https://gamehubapi-test.onrender.com/api/games');

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('Raw API response:', data);
			console.log('Type of data:', typeof data);
			console.log('Is array:', Array.isArray(data));

			// Kiểm tra xem data có phải là array không
			let gamesArray: Game[] = [];

			if (Array.isArray(data)) {
				gamesArray = data;
			} else if (data && Array.isArray(data.games)) {
				// Nếu API trả về object có property games
				gamesArray = data.games;
			} else if (data && Array.isArray(data.data)) {
				// Nếu API trả về object có property data
				gamesArray = data.data;
			} else if (data && typeof data === 'object') {
				// Nếu API trả về object, thử tìm array trong object
				const possibleArrays = Object.values(data).filter(Array.isArray);
				if (possibleArrays.length > 0) {
					gamesArray = possibleArrays[0] as Game[];
				}
			}

			console.log('Games array:', gamesArray);
			console.log('Number of games:', gamesArray.length);

			if (!Array.isArray(gamesArray) || gamesArray.length === 0) {
				throw new Error('No valid games data found in API response');
			}

			// Sort games by rating in descending order
			const sortedGames = gamesArray.sort((a: Game, b: Game) => (b.rating || 0) - (a.rating || 0));
			setGames(sortedGames);

			message.success(`Đã tải thành công ${sortedGames.length} game`);
		} catch (error) {
			console.error('Error fetching games:', error);
			if (error instanceof Error) {
				message.error(`Lỗi: ${error.message}`);
			} else {
				message.error('Không thể tải dữ liệu game. Vui lòng thử lại sau.');
			}

			// Fallback: sử dụng dữ liệu mẫu nếu API lỗi
			console.log('Using fallback data...');
			const sortedFallbackGames = [...fallbackGames].sort((a: Game, b: Game) => (b.rating || 0) - (a.rating || 0));
			setGames(sortedFallbackGames);
			message.info(`Đang sử dụng dữ liệu mẫu (${sortedFallbackGames.length} game)`);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGames();
	}, []);

	// Get unique genres and platforms for filter options
	const uniqueGenres = useMemo(() => {
		const allGenres = games.flatMap((game) => game.genres || []);
		return [...new Set(allGenres)].sort();
	}, [games]);

	const uniquePlatforms = useMemo(() => {
		const allPlatforms = games.flatMap((game) => game.platforms || []);
		return [...new Set(allPlatforms)].sort();
	}, [games]);
	// Filter and sort games
	const filteredAndSortedGames = useMemo(() => {
		const filtered = games.filter((game) => {
			const matchesSearch =
				!searchText ||
				game.title.toLowerCase().includes(searchText.toLowerCase()) ||
				(game.description && game.description.toLowerCase().includes(searchText.toLowerCase()));

			const matchesGenre =
				!filterGenre ||
				(game.genres && game.genres.some((genre) => genre.toLowerCase().includes(filterGenre.toLowerCase())));

			const matchesPlatform =
				!filterPlatform ||
				(game.platforms &&
					game.platforms.some((platform) => platform.toLowerCase().includes(filterPlatform.toLowerCase())));

			return matchesSearch && matchesGenre && matchesPlatform;
		});

		// Sort based on selected criteria
		return filtered.sort((a, b) => {
			switch (sortBy) {
				case 'rating':
					return (b.rating || 0) - (a.rating || 0);
				case 'metacritic':
					return (b.metacritic || 0) - (a.metacritic || 0);
				case 'release_date':
					return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
				default:
					return (b.rating || 0) - (a.rating || 0);
			}
		});
	}, [games, searchText, filterGenre, filterPlatform, sortBy]);

	// Paginate games
	const paginatedGames = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		return filteredAndSortedGames.slice(startIndex, startIndex + pageSize);
	}, [filteredAndSortedGames, currentPage, pageSize]);

	const formatDate = (dateString: string) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString('vi-VN');
	};

	const getRankColor = (index: number) => {
		if (index === 0) return '#FFD700'; // Gold
		if (index === 1) return '#C0C0C0'; // Silver
		if (index === 2) return '#CD7F32'; // Bronze
		return '#8c8c8c';
	};

	const getRankIcon = (index: number) => {
		if (index < 3) {
			return <TrophyOutlined style={{ color: getRankColor(index), fontSize: '20px' }} />;
		}
		return <span style={{ color: '#8c8c8c', fontSize: '18px', fontWeight: 'bold' }}>#{index + 1}</span>;
	};

	const clearFilters = () => {
		setSearchText('');
		setFilterGenre('');
		setFilterPlatform('');
		setSortBy('rating');
		setCurrentPage(1);
	};

	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#FFFCFE' }}>
			<GameHubHeader
				searchText={searchText}
				setSearchText={setSearchText}
				activeNav={activeNav}
				setActiveNav={setActiveNav}
				NAV_ITEMS={NAV_ITEMS}
			/>
			<Navbar
				navItems={NAV_ITEMS}
				activeNav={activeNav}
				setActiveNav={setActiveNav}
				navLinks={{ 0: '/dang-theo-doi', 1: '/dashboard', 2: '/bang-xep-hang' }}
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
								<Search
									placeholder='Tìm kiếm game...'
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									style={{ width: '100%' }}
								/>
							</Col>
							<Col xs={24} sm={12} md={4}>
								<Select
									placeholder='Thể loại'
									value={filterGenre}
									onChange={setFilterGenre}
									style={{ width: '100%' }}
									allowClear
								>
									{uniqueGenres.map((genre) => (
										<Option key={genre} value={genre}>
											{genre}
										</Option>
									))}
								</Select>
							</Col>
							<Col xs={24} sm={12} md={4}>
								<Select
									placeholder='Nền tảng'
									value={filterPlatform}
									onChange={setFilterPlatform}
									style={{ width: '100%' }}
									allowClear
								>
									{uniquePlatforms.map((platform) => (
										<Option key={platform} value={platform}>
											{platform}
										</Option>
									))}
								</Select>
							</Col>
							<Col xs={24} sm={12} md={5}>
								<Select value={sortBy} onChange={setSortBy} style={{ width: '100%' }}>
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
					) : (
						<>
							<Row gutter={[16, 16]}>
								{paginatedGames.map((game, index) => {
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
															fallback='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L2rJoICKFhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhLSEhISEhIZmL6yCkpCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkX/2Q=='
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
															{game.genres.slice(0, 2).map((genre) => (
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
							<div style={{ textAlign: 'center', marginTop: '32px' }}>
								<Pagination
									current={currentPage}
									total={filteredAndSortedGames.length}
									pageSize={pageSize}
									onChange={(page) => setCurrentPage(page)}
									showSizeChanger={false}
									showQuickJumper
									showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} game`}
								/>
							</div>
						</>
					)}
				</div>
			</Content>
		</Layout>
	);
};

export default BangXepHang;
