import axios from 'axios';


export interface DashboardStatsResponse {
  bannedUsers: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalUsers: number;
  totalReviews: number;
  totalGames: number;
  approvedReviews: number;
  pendingReviews: number;
}

export interface ReviewsByDateResponse {
  date: string;
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}
