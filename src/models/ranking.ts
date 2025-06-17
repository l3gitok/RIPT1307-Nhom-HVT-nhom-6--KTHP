import { useState, useCallback, useMemo } from 'react';
import { message } from 'antd';
import {
	type RankingFilters,
	type RankingState,
	filterAndSortGames,
	getUniqueValues,
	paginateGames,
	fetchRankingGamesAPI,
} from '@/services/RankingServices';

export default function useRankingModel() {
	const [state, setState] = useState<RankingState>({
		games: [],
		loading: true,
		currentPage: 1,
		pageSize: 20,
		filters: {
			searchText: '',
			filterGenre: '',
			filterPlatform: '',
			sortBy: 'rating',
		},
	});

	// Load games from API
	const loadGames = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, loading: true }));

			const games = await fetchRankingGamesAPI();

			setState((prev) => ({
				...prev,
				games,
				loading: false,
			}));

			message.success(`Đã tải thành công ${games.length} game`);
		} catch (error) {
			setState((prev) => ({
				...prev,
				games: [],
				loading: false,
			}));

			if (error instanceof Error) {
				message.error(`Lỗi: ${error.message}`);
			} else {
				message.error('Không thể tải dữ liệu game. Vui lòng thử lại sau.');
			}
		}
	}, []);

	// Update filters
	const updateFilters = useCallback((newFilters: Partial<RankingFilters>) => {
		setState((prev) => ({
			...prev,
			filters: { ...prev.filters, ...newFilters },
			currentPage: 1, // Reset to first page when filters change
		}));
	}, []);

	// Clear all filters
	const clearFilters = useCallback(() => {
		setState((prev) => ({
			...prev,
			filters: {
				searchText: '',
				filterGenre: '',
				filterPlatform: '',
				sortBy: 'rating',
			},
			currentPage: 1,
		}));
	}, []);

	// Set current page
	const setCurrentPage = useCallback((page: number) => {
		setState((prev) => ({ ...prev, currentPage: page }));
	}, []);

	// Get unique genres and platforms for filter options
	const uniqueGenres = useMemo(() => {
		return getUniqueValues(state.games, 'genres');
	}, [state.games]);

	const uniquePlatforms = useMemo(() => {
		return getUniqueValues(state.games, 'platforms');
	}, [state.games]);

	// Filter and sort games
	const filteredAndSortedGames = useMemo(() => {
		return filterAndSortGames(state.games, state.filters);
	}, [state.games, state.filters]);

	// Paginate games
	const paginatedGames = useMemo(() => {
		return paginateGames(filteredAndSortedGames, state.currentPage, state.pageSize);
	}, [filteredAndSortedGames, state.currentPage, state.pageSize]);

	return {
		// State
		games: state.games,
		loading: state.loading,
		currentPage: state.currentPage,
		pageSize: state.pageSize,
		filters: state.filters,

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
	};
}
