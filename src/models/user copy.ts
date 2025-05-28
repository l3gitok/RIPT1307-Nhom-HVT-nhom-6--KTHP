export interface UserProfile {
	username: string;
	avatar_url?: string;
	cover_url?: string;
}

export interface User {
	_id: string;
	email: string;
	profile: UserProfile;
	role?: string;
	followers?: string[];
	following?: string[];
	is_verified?: boolean;
	status?: string;
	created_at?: string;
	updated_at?: string;
}
