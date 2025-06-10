import { useState, useCallback } from 'react';
import { message } from 'antd';
import axios from 'axios';
import type { 
    User, 
    UserResponse,
    FollowUser,
    FollowResponse,
    FollowListResponse,
    FollowStatusResponse,
    FollowCountsResponse,
    EditProfileFormValues,
    EditProfileResponse,
    CloudinaryUploadResponse,
    CloudinaryDeleteResponse
} from '../services/UserServices';

const API_BASE_URL = 'https://gamehubapi-test.onrender.com/api';
const API_USERS_URL = `${API_BASE_URL}/auth/users`;
const API_FOLLOWERS_URL = `${API_BASE_URL}/followers`;
const API_UPLOAD_URL = `${API_BASE_URL}/upload`; // ✅ Cloudinary upload endpoint

export default function useUserModel() {
    // ===== USER STATES =====
    const [data, setData] = useState<User[]>([]);
    const [visible, setVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [row, setRow] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    // ===== FOLLOW STATES =====
    const [followLoading, setFollowLoading] = useState(false);
    const [followersData, setFollowersData] = useState<FollowUser[]>([]);
    const [followingData, setFollowingData] = useState<FollowUser[]>([]);
    const [followModalLoading, setFollowModalLoading] = useState(false);
    const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
    const [followStatus, setFollowStatus] = useState<{[userId: string]: boolean}>({});

    // ===== EDIT PROFILE STATES =====
    const [editProfileVisible, setEditProfileVisible] = useState(false);
    const [editProfileLoading, setEditProfileLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

    // ===== HELPER FUNCTIONS =====
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    // ✅ Debug helper để log API responses
    const logApiResponse = useCallback((endpoint: string, data: any) => {
        console.group(`🔍 API Response: ${endpoint}`);
        console.log('Raw Data:', data);
        console.log('Data Type:', typeof data);
        console.log('Is Array:', Array.isArray(data));
        if (data && typeof data === 'object') {
            console.log('Object Keys:', Object.keys(data));
        }
        console.groupEnd();
    }, []);

    // ✅ Improved data processor với extensive logging
    const processFollowListData = useCallback((responseData: any, endpoint: string): FollowUser[] => {
        logApiResponse(endpoint, responseData);

        if (!responseData) {
            console.warn('❌ No response data');
            return [];
        }
        
        // Case 1: Direct array of users
        if (Array.isArray(responseData)) {
            console.log('✅ Direct array format');
            return responseData.filter(user => user && user._id);
        }
        
        // Case 2: Response has 'data' property
        if (responseData.data) {
            const data = responseData.data;
            console.log('📦 Data property found:', data);
            
            // Case 2a: data.followers array
            if (data.followers && Array.isArray(data.followers)) {
                console.log('✅ data.followers format');
                return data.followers
                    .map((item: any) => {
                        // Item might be user directly or wrapped in object
                        if (item.user) return item.user;
                        if (item._id) return item;
                        return null;
                    })
                    .filter(Boolean);
            }
            
            // Case 2b: data.following array
            if (data.following && Array.isArray(data.following)) {
                console.log('✅ data.following format');
                return data.following
                    .map((item: any) => {
                        if (item.user) return item.user;
                        if (item._id) return item;
                        return null;
                    })
                    .filter(Boolean);
            }
            
            // Case 2c: data.users array
            if (data.users && Array.isArray(data.users)) {
                console.log('✅ data.users format');
                return data.users.filter((user: any) => user && user._id);
            }
            
            // Case 2d: data is direct array
            if (Array.isArray(data)) {
                console.log('✅ data is direct array');
                return data.filter(user => user && user._id);
            }
        }
        
        // Case 3: Response has 'followers' or 'following' at root
        if (responseData.followers && Array.isArray(responseData.followers)) {
            console.log('✅ Root followers format');
            return responseData.followers.filter((user: any) => user && user._id);
        }
        
        if (responseData.following && Array.isArray(responseData.following)) {
            console.log('✅ Root following format');
            return responseData.following.filter((user: any) => user && user._id);
        }
        
        console.warn('❌ Unknown data format');
        return [];
    }, [logApiResponse]);

    // ===== EXISTING USER FUNCTIONS =====
    const getDataUser = async () => {
        setLoading(true);
        try {
            const res = await axios.get<UserResponse>(API_USERS_URL, {
                headers: getAuthHeaders(),
            });
            
            if (res.data.success && res.data.users) {
                setData(res.data.users);
            } else {
                message.error(res.data.message || 'Failed to fetch users.');
            }
        } catch (err: any) {
            console.error('Error fetching users:', err);
            message.error(err?.response?.data?.message || 'Lỗi khi tải danh sách user');
        } finally {
            setLoading(false);
        }
    };

    // ===== FOLLOW FUNCTIONS =====

    // Follow user
    const followUser = useCallback(async (userId: string): Promise<boolean> => {
        setFollowLoading(true);
        try {
            const res = await axios.post<FollowResponse>(
                `${API_FOLLOWERS_URL}/${userId}`,
                {},
                { headers: getAuthHeaders() }
            );

            logApiResponse(`POST ${API_FOLLOWERS_URL}/${userId}`, res.data);

            if (res.data.success) {
                setFollowStatus(prev => ({ ...prev, [userId]: true }));
                message.success('Đã theo dõi thành công');
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Follow error:', error);
            logApiResponse(`POST ${API_FOLLOWERS_URL}/${userId} ERROR`, error.response?.data);
            
            const errorMessage = error?.response?.data?.message;
            if (errorMessage?.includes('Đã follow')) {
                message.warning('Bạn đã theo dõi người này rồi');
            } else if (errorMessage?.includes('follow chính mình')) {
                message.warning('Bạn không thể theo dõi chính mình');
            } else {
                message.error(errorMessage || 'Có lỗi xảy ra khi theo dõi');
            }
            return false;
        } finally {
            setFollowLoading(false);
        }
    }, [getAuthHeaders, logApiResponse]);

    // Unfollow user
    const unfollowUser = useCallback(async (userId: string): Promise<boolean> => {
        setFollowLoading(true);
        try {
            const res = await axios.delete<FollowResponse>(
                `${API_FOLLOWERS_URL}/${userId}`,
                { headers: getAuthHeaders() }
            );

            logApiResponse(`DELETE ${API_FOLLOWERS_URL}/${userId}`, res.data);

            if (res.data.success) {
                setFollowStatus(prev => ({ ...prev, [userId]: false }));
                message.success('Đã bỏ theo dõi');
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Unfollow error:', error);
            logApiResponse(`DELETE ${API_FOLLOWERS_URL}/${userId} ERROR`, error.response?.data);
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi bỏ theo dõi');
            return false;
        } finally {
            setFollowLoading(false);
        }
    }, [getAuthHeaders, logApiResponse]);

    // ✅ Get followers với better logging
    const getFollowers = useCallback(async (userId: string): Promise<FollowUser[]> => {
        setFollowModalLoading(true);
        try {
            const endpoint = `${API_FOLLOWERS_URL}/${userId}/followers`;
            const res = await axios.get(endpoint, { headers: getAuthHeaders() });

            console.log(`🔍 FOLLOWERS Response for ${userId}:`, {
                status: res.status,
                success: res.data.success,
                dataType: typeof res.data.data,
                dataKeys: res.data.data ? Object.keys(res.data.data) : 'no data',
                rawData: res.data.data
            });

            if (res.data.success) {
                const processedData = processFollowListData(res.data, endpoint);
                console.log(`✅ Processed ${processedData.length} followers:`, processedData);
                
                setFollowersData(processedData);
                return processedData;
            } else {
                console.error('❌ API returned success: false', res.data);
                setFollowersData([]);
                return [];
            }
        } catch (error: any) {
            console.error('❌ GET FOLLOWERS ERROR:', error.response?.data || error.message);
            setFollowersData([]);
            return [];
        } finally {
            setFollowModalLoading(false);
        }
    }, [getAuthHeaders, processFollowListData]);

    // ✅ Get following với better logging
    const getFollowing = useCallback(async (userId: string): Promise<FollowUser[]> => {
        setFollowModalLoading(true);
        try {
            const endpoint = `${API_FOLLOWERS_URL}/${userId}/following`;
            const res = await axios.get(endpoint, { headers: getAuthHeaders() });

            console.log(`🔍 FOLLOWING Response for ${userId}:`, {
                status: res.status,
                success: res.data.success,
                dataType: typeof res.data.data,
                dataKeys: res.data.data ? Object.keys(res.data.data) : 'no data',
                rawData: res.data.data
            });

            if (res.data.success) {
                const processedData = processFollowListData(res.data, endpoint);
                console.log(`✅ Processed ${processedData.length} following:`, processedData);
                
                setFollowingData(processedData);
                return processedData;
            } else {
                console.error('❌ API returned success: false', res.data);
                setFollowingData([]);
                return [];
            }
        } catch (error: any) {
            console.error('❌ GET FOLLOWING ERROR:', error.response?.data || error.message);
            setFollowingData([]);
            return [];
        } finally {
            setFollowModalLoading(false);
        }
    }, [getAuthHeaders, processFollowListData]);

    // Check follow status
    const checkFollowStatus = useCallback(async (userId: string): Promise<boolean> => {
        try {
            const endpoint = `${API_FOLLOWERS_URL}/status/${userId}`;
            const res = await axios.get<FollowStatusResponse>(endpoint, { headers: getAuthHeaders() });

            logApiResponse(endpoint, res.data);

            const isFollowing = res.data?.data?.isFollowing || false;
            setFollowStatus(prev => ({ ...prev, [userId]: isFollowing }));
            return isFollowing;
        } catch (error: any) {
            console.error('Check follow status error:', error);
            logApiResponse(`${API_FOLLOWERS_URL}/status/${userId} ERROR`, error.response?.data);
            return false;
        }
    }, [getAuthHeaders, logApiResponse]);

    // ✅ Get follow counts với comprehensive logging
    const getFollowCounts = useCallback(async (userId?: string) => {
        try {
            const endpoint = userId 
                ? `${API_FOLLOWERS_URL}/counts/${userId}`
                : `${API_FOLLOWERS_URL}/counts`;
                
            const res = await axios.get(endpoint, {
                headers: getAuthHeaders()
            });

            console.group(`🔍 GET FOLLOW COUNTS for userId: ${userId || 'self'}`);
            console.log('Full Response:', res);
            console.log('Response Data:', res.data);
            console.groupEnd();

            if (res.data.success && res.data.data) {
                const counts = {
                    followers: res.data.data.followers || 0,
                    following: res.data.data.following || 0
                };
                console.log('🎯 Final Counts:', counts);
                setFollowCounts(counts);
                return counts;
            } else {
                console.warn('❌ Invalid counts response:', res.data);
                return null;
            }
        } catch (error: any) {
            console.group('❌ GET FOLLOW COUNTS ERROR');
            console.error('Error:', error);
            console.error('Error Response:', error.response?.data);
            console.groupEnd();
            return null;
        }
    }, [getAuthHeaders]);

    // Toggle follow
    const toggleFollow = useCallback(async (userId: string): Promise<boolean> => {
        const currentStatus = followStatus[userId] || false;
        
        if (currentStatus) {
            return await unfollowUser(userId);
        } else {
            return await followUser(userId);
        }
    }, [followStatus, followUser, unfollowUser]);

    // Clear follow data
    const clearFollowData = useCallback(() => {
        setFollowersData([]);
        setFollowingData([]);
        setFollowStatus({});
        setFollowCounts({ followers: 0, following: 0 });
    }, []);

    // ===== EDIT PROFILE FUNCTIONS =====

    // ✅ Update user profile
    const updateUserProfile = useCallback(async (profileData: EditProfileFormValues): Promise<User | null> => {
        setEditProfileLoading(true);
        try {
            const res = await axios.put<EditProfileResponse>(
                `${API_BASE_URL}/auth/profile`,
                profileData,
                { headers: getAuthHeaders() }
            );

            if (res.data.success && res.data.user) {
                message.success('Cập nhật profile thành công!');
                return res.data.user;
            } else {
                message.error(res.data.message || 'Cập nhật profile thất bại');
                return null;
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật profile';
            message.error(errorMessage);
            return null;
        } finally {
            setEditProfileLoading(false);
        }
    }, [getAuthHeaders]);

    // ✅ Upload avatar sử dụng Cloudinary endpoint
    const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await axios.post<CloudinaryUploadResponse>(
                `${API_UPLOAD_URL}/avatar`,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (res.data.success && res.data.data?.url) {
                message.success('Upload avatar thành công!');
                return res.data.data.url;
            } else {
                message.error(res.data.message || 'Upload avatar thất bại');
                return null;
            }
        } catch (error: any) {
            console.error('Upload avatar error:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi upload avatar';
            message.error(errorMessage);
            return null;
        } finally {
            setUploadLoading(false);
        }
    }, [getAuthHeaders]);

    // ✅ Upload cover image sử dụng Cloudinary endpoint
    const uploadCoverImage = useCallback(async (file: File): Promise<string | null> => {
        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await axios.post<CloudinaryUploadResponse>(
                `${API_UPLOAD_URL}/image`,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (res.data.success && res.data.data?.url) {
                message.success('Upload ảnh bìa thành công!');
                return res.data.data.url;
            } else {
                message.error(res.data.message || 'Upload ảnh bìa thất bại');
                return null;
            }
        } catch (error: any) {
            console.error('Upload cover image error:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh bìa';
            message.error(errorMessage);
            return null;
        } finally {
            setUploadLoading(false);
        }
    }, [getAuthHeaders]);

    // ✅ Generic upload image function
    const uploadImage = useCallback(async (file: File, type: 'avatar' | 'cover'): Promise<string | null> => {
        if (type === 'avatar') {
            return await uploadAvatar(file);
        } else {
            return await uploadCoverImage(file);
        }
    }, [uploadAvatar, uploadCoverImage]);

    // ✅ Delete image from Cloudinary
    const deleteImage = useCallback(async (publicId: string): Promise<boolean> => {
        try {
            const res = await axios.delete<CloudinaryDeleteResponse>(
                `${API_UPLOAD_URL}/${publicId}`,
                { headers: getAuthHeaders() }
            );

            if (res.data.success) {
                message.success('Xóa ảnh thành công!');
                return true;
            } else {
                message.error(res.data.message || 'Xóa ảnh thất bại');
                return false;
            }
        } catch (error: any) {
            console.error('Delete image error:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa ảnh';
            message.error(errorMessage);
            return false;
        }
    }, [getAuthHeaders]);

    // Show/Hide edit profile modal
    const showEditProfileModal = useCallback(() => {
        setEditProfileVisible(true);
    }, []);

    const hideEditProfileModal = useCallback(() => {
        setEditProfileVisible(false);
    }, []);

    return {
        // ===== USER DATA =====
        data,
        visible,
        isEdit,
        row,
        loading,
        setVisible,
        setIsEdit,
        setRow,
        getDataUser,

        // ===== EDIT PROFILE DATA =====
        editProfileVisible,
        editProfileLoading,
        uploadLoading,

        // ===== FOLLOW DATA =====
        followLoading,
        followersData,
        followingData,
        followModalLoading,
        followCounts,
        followStatus,

        // ===== EDIT PROFILE FUNCTIONS =====
        updateUserProfile,
        uploadImage,
        uploadAvatar,
        uploadCoverImage,
        deleteImage,
        showEditProfileModal,
        hideEditProfileModal,

        // ===== FOLLOW FUNCTIONS =====
        followUser,
        unfollowUser,
        getFollowers,
        getFollowing,
        checkFollowStatus,
        getFollowCounts,
        toggleFollow,
        clearFollowData,
    };
}