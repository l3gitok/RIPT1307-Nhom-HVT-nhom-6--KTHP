import { useState, useCallback } from 'react';
import { message } from 'antd';
import { fetchReviews, createReview } from './review';
import { toggleReviewLike } from './comment';
import { fetchGames } from './game';
import type { Review } from '../services/ReviewServices';
import type { Game } from '../services/GameServices';
import type { User } from '../services/UserServices';
import type { HomePageState } from '../services/HomePageServices';
import { API_BASE_URL } from '../services/HomePageServices';
import axios from 'axios';

export default function useHomePageModel() {
	const [state, setState] = useState<HomePageState>({
		reviews: [],
		reviewsLoading: false,
		pagination: { page: 1, limit: 10, total: 0 },
		games: [],
		reviewLikes: {},
		reviewLikeCounts: {},
		likingReview: {},
	});

	// Get current user
	const getCurrentUser = useCallback(async (): Promise<User | null> => {
		const token = localStorage.getItem('accessToken');
		if (!token) return null;

		try {
			const res = await axios.get(`${API_BASE_URL}/auth/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.data.success) {
				return res.data.user;
			}
		} catch (error: any) {
			console.error('Error fetching current user:', error);
			if (error.response?.status === 401) {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
			}
		}
		return null;
	}, []);

	// Load reviews
	const loadReviews = useCallback(
		async (page = 1, append = false) => {
			setState((prev) => ({ ...prev, reviewsLoading: true }));

			try {
				const result = await fetchReviews({
					page,
					limit: state.pagination.limit,
					status: 'approved',
				});

				setState((prev) => ({
					...prev,
					reviews: append ? [...prev.reviews, ...result.reviews] : result.reviews,
					pagination: {
						...prev.pagination,
						page,
						total: result.pagination.total,
					},
					reviewsLoading: false,
				}));
			} catch (error) {
				console.error('Error loading reviews:', error);
				message.error('Không thể tải bài viết');
				setState((prev) => ({ ...prev, reviewsLoading: false }));
			}
		},
		[state.pagination.limit],
	);

	// Load games
	const loadGames = useCallback(async () => {
		try {
			const result = await fetchGames({ limit: 100 });
			setState((prev) => ({ ...prev, games: result.games }));
		} catch (error) {
			console.error('Error loading games:', error);
		}
	}, []);

	// Toggle like
	const handleToggleReviewLike = useCallback(async (reviewId: string, currentUser: User | null) => {
		if (!currentUser) {
			message.warning('Vui lòng đăng nhập để thích bài viết');
			return;
		}

		setState((prev) => ({
			...prev,
			likingReview: { ...prev.likingReview, [reviewId]: true },
		}));

		try {
			const result = await toggleReviewLike(reviewId);
			setState((prev) => ({
				...prev,
				reviewLikes: { ...prev.reviewLikes, [reviewId]: result.liked },
				reviewLikeCounts: { ...prev.reviewLikeCounts, [reviewId]: result.likesCount },
				likingReview: { ...prev.likingReview, [reviewId]: false },
			}));
		} catch (error: any) {
			console.error('Error toggling review like:', error);
			message.error(error.message || 'Không thể thích/bỏ thích bài viết');
			setState((prev) => ({
				...prev,
				likingReview: { ...prev.likingReview, [reviewId]: false },
			}));
		}
	}, []);

	// Load more
	const handleLoadMore = useCallback(() => {
		if (state.reviews.length < state.pagination.total) {
			loadReviews(state.pagination.page + 1, true);
		}
	}, [state.reviews.length, state.pagination.total, state.pagination.page, loadReviews]);

	// Update reviews
	const updateReviews = useCallback((updater: (reviews: Review[]) => Review[]) => {
		setState((prev) => ({ ...prev, reviews: updater(prev.reviews) }));
	}, []);
	// Initialize like states
	const initializeLikeStates = useCallback((currentUser: User | null, reviews: Review[]) => {
		if (currentUser && reviews.length > 0) {
			const initialLikeCounts: Record<string, number> = {};
			const initialLikeStatus: Record<string, boolean> = {};

			reviews.forEach((review) => {
				initialLikeCounts[review._id] = review.likes_count || (Array.isArray(review.likes) ? review.likes.length : 0);

				if (Array.isArray(review.likes)) {
					initialLikeStatus[review._id] = review.likes.some((like: any) => {
						const likeUserId = typeof like.user_id === 'string' ? like.user_id : like.user_id?._id;
						return likeUserId?.toString() === currentUser._id?.toString();
					});
				} else {
					initialLikeStatus[review._id] = false;
				}
			});

			setState((prev) => ({
				...prev,
				reviewLikeCounts: initialLikeCounts,
				reviewLikes: initialLikeStatus,
			}));
		}
	}, []);

	// Create new review
	const createNewReview = useCallback(
		async (reviewData: { content: string; rating: number; game_id: string; images?: string[] }) => {
			try {
				const result = await createReview(reviewData);
				return result;
			} catch (error: any) {
				console.error('Error creating review:', error);
				throw error;
			}
		},
		[],
	);

	return {
		// State
		...state,

		// Actions
		getCurrentUser,
		loadReviews,
		loadGames,
		handleToggleReviewLike,
		handleLoadMore,
		updateReviews,
		initializeLikeStates,
		createNewReview,
	};
}
