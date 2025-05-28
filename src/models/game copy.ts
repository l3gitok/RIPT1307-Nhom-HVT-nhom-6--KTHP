export interface Game {
	_id: string;
	title: string;
	description: string;
	cover_url: string;
	genres?: string[];
	platforms?: string[];
	rating?: number;
	metacritic?: number;
	esrb_rating?: string;
	developer?: string[];
	publisher?: string[];
	slug?: string;
	approved?: boolean;
	created_by?: string;
	created_at?: string;
	updated_at?: string;
}
