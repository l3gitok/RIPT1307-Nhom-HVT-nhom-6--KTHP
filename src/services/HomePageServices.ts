import type { Review } from './ReviewServices';
import type { Game } from './GameServices';
import type { User } from './UserServices';

// ===== INTERFACES =====
export interface HomePageState {
	reviews: Review[];
	reviewsLoading: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
	games: Game[];
	reviewLikes: { [key: string]: boolean };
	reviewLikeCounts: { [key: string]: number };
	likingReview: { [key: string]: boolean };
}

export interface PostModalState {
	postImages: string[];
	postContent: string;
	submittingPost: boolean;
	uploadLoading: boolean;
	uploadProgress: number;
}

export interface NavigationState {
	searchText: string;
	activeNav: number;
	postModalOpen: boolean;
}

export interface ReviewItemProps {
	review: Review;
	games: Game[];
	currentUser: User | null;
	reviewLikes: { [key: string]: boolean };
	reviewLikeCounts: { [key: string]: number };
	likingReview: { [key: string]: boolean };
	onToggleLike: (reviewId: string) => void;
	onCommentsCountChange: (reviewId: string, count: number) => void;
}

// ===== CONSTANTS =====
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

// ===== UTILITY FUNCTIONS =====
export const getNavKeyFromPath = (pathname: string): number => {
	if (pathname === '/home' || pathname === '/') return 1;
	if (pathname === '/dang-theo-doi') return 0;
	if (pathname === '/bang-xep-hang') return 2;
	return 1;
};

export const getGameDisplayInfo = (review: Review, games: Game[]) => {
	let gameName = 'Unknown Game';
	let isNewGame = false;

	if (typeof review.game_id === 'object' && review.game_id !== null && 'title' in review.game_id) {
		gameName = review.game_id.title;
	} else if (typeof review.game_id === 'string') {
		const existingGame = games.find((game) => game._id === review.game_id);
		if (existingGame) {
			gameName = existingGame.title;
		} else {
			gameName = review.game_title || review.game_id;
			isNewGame = true;
		}
	}

	return { gameName, isNewGame };
};

export const getAuthorInfo = (review: Review) => {
	const author = typeof review.author_id === 'object' && review.author_id !== null ? review.author_id : null;
	const authorName = author?.profile?.username || author?.email?.split('@')[0] || 'Unknown User';
	const authorId = typeof review.author_id === 'string' ? review.author_id : author?._id;

	return { author, authorName, authorId };
};
