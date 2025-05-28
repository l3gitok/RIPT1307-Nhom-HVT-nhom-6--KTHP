import axios from 'axios';
import type { UserReport } from '../services/ReportServices';
const API_URL = 'https://gamehubapi-test.onrender.com/api/user-reports'; // Sửa "úser-reports" thành "user-reports"

function getAuthHeader() {
	const token = localStorage.getItem('accessToken');
	return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchReports(params?: {
	page?: number;
	limit?: number;
	status?: string;
	reported_user_id?: string;
}): Promise<{ reports: UserReport[]; pagination: any }> {
	const response = await axios.get(API_URL, {
		params,
		headers: getAuthHeader(),
	});

	const reports = Array.isArray(response.data?.reports) ? response.data.reports : [];

	const pagination = {
		total: response.data?.total || 0,
		totalPages: response.data?.totalPages || 1,
		currentPage: response.data?.page || 1,
	};

	return { reports, pagination };
}

export async function updateReportStatus(
	reportId: string,
	status: 'pending' | 'resolved' | 'rejected',
	admin_note?: string,
): Promise<UserReport> {
	const response = await axios.patch(
		`${API_URL}/${reportId}/status`,
		{ status, admin_note }, // Sửa adminNote thành admin_note
		{ headers: getAuthHeader() },
	);
	return response.data;
}

export async function getReportStats(): Promise<any> {
	const response = await axios.get(`${API_URL}/stats`, {
		headers: getAuthHeader(),
	});
	return response.data;
}
