import { useState, useEffect } from 'react';
import { Layout, Form } from 'antd';
import { useHistory } from 'umi';
import GameHubHeader from '@/components/GameHub/Header';
import Navbar from '@/components/GameHub/Navbar';
import PostButton from '@/components/HomePage/PostButton';
import ReviewsList from '@/components/HomePage/ReviewsList';
import PostModal from '@/components/HomePage/PostModal';
import useHomePageModel from '@/models/homepage';
import { NAV_ITEMS, NAV_ROUTES, getNavKeyFromPath } from '@/services/HomePageServices';
import type { User } from '@/services/UserServices';

const { Content } = Layout;

const TrangChu = (): JSX.Element => {
	const history = useHistory();
	const [form] = Form.useForm();

	// Navigation states
	const [searchText, setSearchText] = useState('');
	const [activeNav, setActiveNav] = useState(1);
	const [postModalOpen, setPostModalOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	// HomePage model
	const {
		reviews,
		reviewsLoading,
		pagination,
		games,
		reviewLikes,
		reviewLikeCounts,
		likingReview,
		getCurrentUser,
		loadReviews,
		loadGames,
		handleToggleReviewLike,
		handleLoadMore,
		updateReviews,
		initializeLikeStates,
		createNewReview,
	} = useHomePageModel();

	// Initialize navigation from URL
	useEffect(() => {
		const currentPath = window.location.pathname;
		setActiveNav(getNavKeyFromPath(currentPath));
	}, []);

	// Get current user
	useEffect(() => {
		const fetchCurrentUser = async () => {
			const user = await getCurrentUser();
			setCurrentUser(user);
		};
		fetchCurrentUser();
	}, [getCurrentUser]);

	// Load data
	useEffect(() => {
		loadReviews();
		loadGames();
	}, [loadReviews, loadGames]);

	// Initialize like states when user and reviews are loaded
	useEffect(() => {
		initializeLikeStates(currentUser, reviews);
	}, [currentUser, reviews, initializeLikeStates]);

	// Handle navigation
	const handleNavChange = (navKey: number) => {
		setActiveNav(navKey);
		const route = NAV_ROUTES[navKey as keyof typeof NAV_ROUTES];
		if (route) {
			history.push(route);
		}
	}; // Handle comments count change
	const handleCommentsCountChange = (reviewId: string, count: number) => {
		updateReviews((prev) =>
			prev.map((review) => (review._id === reviewId ? { ...review, replies_count: count } : review)),
		);
	};

	// Handle post modal success
	const handlePostSuccess = () => {
		setPostModalOpen(false);
		form.resetFields();
		loadReviews(); // Reload reviews
	};

	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#FFFCFE' }}>
			<GameHubHeader
				searchText={searchText}
				setSearchText={setSearchText}
				activeNav={activeNav}
				setActiveNav={handleNavChange}
				NAV_ITEMS={NAV_ITEMS}
			/>

			<Navbar navItems={NAV_ITEMS} activeNav={activeNav} setActiveNav={handleNavChange} navLinks={NAV_ROUTES} />

			<Content
				style={{
					padding: '24px',
					backgroundColor: '#FFFCFE',
					paddingTop: '120px',
					minHeight: 'calc(100vh - 120px)',
				}}
			>
				<PostButton currentUser={currentUser} onOpenModal={() => setPostModalOpen(true)} />
				<ReviewsList
					reviews={reviews}
					games={games}
					currentUser={currentUser}
					reviewsLoading={reviewsLoading}
					pagination={pagination}
					reviewLikes={reviewLikes}
					reviewLikeCounts={reviewLikeCounts}
					likingReview={likingReview}
					onToggleLike={(reviewId) => handleToggleReviewLike(reviewId, currentUser)}
					onLoadMore={handleLoadMore}
					onCommentsCountChange={handleCommentsCountChange}
					onOpenModal={() => setPostModalOpen(true)}
				/>{' '}
				{/* Post Modal */}
				<PostModal
					visible={postModalOpen}
					onCancel={() => setPostModalOpen(false)}
					form={form}
					games={games}
					currentUser={currentUser}
					onSuccess={handlePostSuccess}
					createNewReview={createNewReview}
				/>
			</Content>
		</Layout>
	);
};

export default TrangChu;
