export interface Game {
	_id: string;
	title: string;
	description?: string;
	cover_url?: string;
	release_date?: string;
	genres?: string[];
	platforms?: string[];
	rating?: number;
	metacritic?: number;
	esrb_rating?: string;
	developer?: string[];
	publisher?: string[];
	rawg_id?: number;
	slug?: string;
	approved?: boolean;
	created_at?: string;
	updated_at?: string;
}