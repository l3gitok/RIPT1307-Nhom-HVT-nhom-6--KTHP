import axios from 'axios';
import { Game } from '../services/GameServices';

const API_URL = 'https://gamehubapi-test.onrender.com/api/games';

function getAuthHeader() {
	const token = localStorage.getItem('accessToken');
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchGames(params?: {
	page?: number;
	limit?: number;
	search?: string;
	genre?: string;
	platform?: string;
}): Promise<{ games: Game[]; pagination: any }> {
	const response = await axios.get(API_URL, { params });
	return {
		games: response.data.data,
		pagination: response.data.pagination,
	};
}

export async function fetchGameById(id: string): Promise<Game> {
	const response = await axios.get(`${API_URL}/${id}`);
	return response.data.data;
}

export async function createGame(game: Game): Promise<Game> {
	const response = await axios.post(API_URL, game, {
		headers: getAuthHeader(),
	});
	return response.data.data;
}

export async function updateGame(id: string, game: Game): Promise<Game> {
	const response = await axios.patch(`${API_URL}/${id}`, game, {
		headers: getAuthHeader(),
	});
	return response.data.data;
}

export async function deleteGame(id: string): Promise<void> {
	await axios.delete(`${API_URL}/${id}`, {
		headers: getAuthHeader(),
	});
}