import type { Game } from './GameServices';

export interface RankingFilters {
	searchText: string;
	filterGenre: string;
	filterPlatform: string;
	sortBy: 'rating' | 'metacritic' | 'release_date';
}

export interface RankingState {
	games: Game[];
	loading: boolean;
	currentPage: number;
	pageSize: number;
	filters: RankingFilters;
}

export interface PaginationInfo {
	current: number;
	pageSize: number;
	total: number;
}

// Navigation constants
export const NAV_ITEMS = [
	{ label: 'Đang theo dõi', key: 0 },
	{ label: 'Trang chủ', key: 1 },
	{ label: 'Bảng Xếp Hạng', key: 2 },
];

export const NAV_ROUTES = {
	0: '/dang-theo-doi',
	1: '/home',
	2: '/bang-xep-hang',
} as const;

export const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';

// Utility functions
export const formatDate = (dateString: string): string => {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	return date.toLocaleDateString('vi-VN');
};

export const getRankColor = (index: number): string => {
	if (index === 0) return '#FFD700'; // Gold
	if (index === 1) return '#C0C0C0'; // Silver
	if (index === 2) return '#CD7F32'; // Bronze
	return '#8c8c8c';
};

export const getUniqueValues = (games: Game[], field: 'genres' | 'platforms'): string[] => {
	const allValues = games.flatMap((game) => game[field] || []);
	return [...new Set(allValues)].sort();
};

export const filterAndSortGames = (games: Game[], filters: RankingFilters): Game[] => {
	const { searchText, filterGenre, filterPlatform, sortBy } = filters;

	const filtered = games.filter((game) => {
		const matchesSearch =
			!searchText ||
			game.title.toLowerCase().includes(searchText.toLowerCase()) ||
			(game.description && game.description.toLowerCase().includes(searchText.toLowerCase()));
		const matchesGenre =
			!filterGenre ||
			(game.genres && game.genres.some((genre: string) => genre.toLowerCase().includes(filterGenre.toLowerCase())));

		const matchesPlatform =
			!filterPlatform ||
			(game.platforms &&
				game.platforms.some((platform: string) => platform.toLowerCase().includes(filterPlatform.toLowerCase())));

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
};

export const paginateGames = (games: Game[], page: number, pageSize: number): Game[] => {
	const startIndex = (page - 1) * pageSize;
	return games.slice(startIndex, startIndex + pageSize);
};

// API Service
export const fetchRankingGamesAPI = async (): Promise<Game[]> => {
	try {
		console.log('Đang gọi API...');

		const response = await fetch(`${API_BASE_URL}/games`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log('Raw API response:', data);

		// Kiểm tra xem data có phải là array không
		let gamesArray: Game[] = [];

		if (Array.isArray(data)) {
			gamesArray = data;
		} else if (data && Array.isArray(data.games)) {
			gamesArray = data.games;
		} else if (data && Array.isArray(data.data)) {
			gamesArray = data.data;
		} else if (data && typeof data === 'object') {
			const possibleArrays = Object.values(data).filter(Array.isArray);
			if (possibleArrays.length > 0) {
				gamesArray = possibleArrays[0] as Game[];
			}
		}

		console.log('Games array:', gamesArray);
		console.log('Number of games:', gamesArray.length);

		if (!Array.isArray(gamesArray) || gamesArray.length === 0) {
			throw new Error('Không có dữ liệu game từ API');
		}

		// Sort games by rating in descending order
		const sortedGames = gamesArray.sort((a: Game, b: Game) => (b.rating || 0) - (a.rating || 0));

		return sortedGames;
	} catch (error) {
		console.error('Error fetching games:', error);
		throw error;
	}
};
