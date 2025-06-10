import { useState } from 'react';

export default () => {
	const [followingList, setFollowingList] = useState<any[]>([]);
	const [followersList, setFollowersList] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	// Lấy thông tin user hiện tại
	const getCurrentUser = () => {
		try {
			const userString = localStorage.getItem('user');
			return userString ? JSON.parse(userString) : null;
		} catch (error) {
			console.error('Error parsing user data:', error);
			return null;
		}
	};

	// Tạo key lưu trữ riêng cho từng user
	const getFollowingKey = (userId: string) => `following_${userId}`;
	const getFollowersKey = (userId: string) => `followers_${userId}`;
	// Lấy danh sách người đang theo dõi
	const getFollowingList = async () => {
		setLoading(true);
		try {
			const currentUser = getCurrentUser();
			if (!currentUser?._id) {
				setFollowingList([]);
				setCurrentUserId(null);
				return;
			}

			// Chỉ reload nếu user khác với user hiện tại
			if (currentUserId !== currentUser._id) {
				setCurrentUserId(currentUser._id);
				const followingKey = getFollowingKey(currentUser._id);
				const followingData = JSON.parse(localStorage.getItem(followingKey) || '[]');
				setFollowingList(followingData);
			}
		} catch (error) {
			console.error('Error loading following list:', error);
			setFollowingList([]);
		} finally {
			setLoading(false);
		}
	}; // Lấy danh sách người theo dõi
	const getFollowersList = async () => {
		setLoading(true);
		try {
			const currentUser = getCurrentUser();
			if (!currentUser?._id) {
				setFollowersList([]);
				return;
			}

			const followersKey = getFollowersKey(currentUser._id);
			const followersData = JSON.parse(localStorage.getItem(followersKey) || '[]');
			setFollowersList(followersData);
		} catch (error) {
			console.error('Error loading followers list:', error);
			setFollowersList([]);
		} finally {
			setLoading(false);
		}
	};

	// Refresh follow lists when user changes
	const refreshFollowData = async () => {
		const currentUser = getCurrentUser();
		if (!currentUser?._id) {
			setFollowingList([]);
			setFollowersList([]);
			setCurrentUserId(null);
			return;
		}

		// Force refresh if user changed
		if (currentUserId !== currentUser._id) {
			setCurrentUserId(currentUser._id);

			const followingKey = getFollowingKey(currentUser._id);
			const followingData = JSON.parse(localStorage.getItem(followingKey) || '[]');
			setFollowingList(followingData);

			const followersKey = getFollowersKey(currentUser._id);
			const followersData = JSON.parse(localStorage.getItem(followersKey) || '[]');
			setFollowersList(followersData);
		}
	};

	// Follow user
	const followUser = async (userId: string, userInfo: any) => {
		try {
			const currentUser = getCurrentUser();
			if (!currentUser?._id) {
				console.error('No current user found');
				return false;
			}

			// Không cho phép follow chính mình
			if (currentUser._id === userId) {
				console.warn('Cannot follow yourself');
				return false;
			}

			const followingKey = getFollowingKey(currentUser._id);
			const currentFollowing = JSON.parse(localStorage.getItem(followingKey) || '[]');
			const isAlreadyFollowing = currentFollowing.some((user: any) => user._id === userId);

			if (!isAlreadyFollowing) {
				const newFollowing = [...currentFollowing, userInfo];
				localStorage.setItem(followingKey, JSON.stringify(newFollowing));
				setFollowingList(newFollowing);
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error following user:', error);
			return false;
		}
	};
	// Unfollow user
	const unfollowUser = async (userId: string) => {
		try {
			const currentUser = getCurrentUser();
			if (!currentUser?._id) {
				console.error('No current user found');
				return false;
			}

			const followingKey = getFollowingKey(currentUser._id);
			const currentFollowing = JSON.parse(localStorage.getItem(followingKey) || '[]');
			const newFollowing = currentFollowing.filter((user: any) => user._id !== userId);
			localStorage.setItem(followingKey, JSON.stringify(newFollowing));
			setFollowingList(newFollowing);
			return true;
		} catch (error) {
			console.error('Error unfollowing user:', error);
			return false;
		}
	};

	// Kiểm tra trạng thái follow
	const isFollowing = (userId: string) => {
		try {
			const currentUser = getCurrentUser();
			if (!currentUser?._id || currentUser._id === userId) {
				return false; // Không hiển thị follow cho chính mình
			}

			const followingKey = getFollowingKey(currentUser._id);
			const currentFollowing = JSON.parse(localStorage.getItem(followingKey) || '[]');
			return currentFollowing.some((user: any) => user._id === userId);
		} catch (error) {
			console.error('Error checking follow status:', error);
			return false;
		}
	}; // Clear follow data when user logs out
	const clearFollowData = () => {
		setFollowingList([]);
		setFollowersList([]);
		setCurrentUserId(null);
	};

	return {
		followingList,
		followersList,
		loading,
		currentUserId,
		getFollowingList,
		getFollowersList,
		refreshFollowData,
		clearFollowData,
		followUser,
		unfollowUser,
		isFollowing,
	};
};
