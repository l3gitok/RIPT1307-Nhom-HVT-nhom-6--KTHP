export interface UserReport {
	_id: string;
	reported_user_id: {
		_id: string;
		profile: {
			username: string;
			avatar_url?: string;
		};
	};
	reporter_id: {
		_id: string;
		profile: {
			username: string;
			avatar_url?: string;
		};
	};
	reason: string;
	description?: string;
	evidence?: {
		type: 'image' | 'link' | 'text';
		content: string;
		created_at: string;
	}[];
	status: 'pending' | 'resolved' | 'rejected';
	admin_note?: string;
	resolved_by?: {
		_id: string;
		profile: {
			username: string;
		};
	};
	resolved_at?: string;
	created_at: string;
	updated_at: string;
}
