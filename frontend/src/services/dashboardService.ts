import apiClient from './api';
import { DashboardStats, ApiResponse } from '../types';

export const dashboardService = {
  // 대시보드 통계 조회
  getStats: () => 
    apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  // 최근 대출 목록
  getRecentLoans: (limit: number = 10) => 
    apiClient.get<ApiResponse<any[]>>(`/dashboard/recent-loans?limit=${limit}`),

  // 인기 도서 Top 10
  getPopularBooks: (limit: number = 10) => 
    apiClient.get<ApiResponse<any[]>>(`/dashboard/popular-books?limit=${limit}`),

  // 월별 대출 통계
  getMonthlyStats: (year: number) => 
    apiClient.get<ApiResponse<any[]>>(`/dashboard/monthly-stats?year=${year}`),

  // 연체 알림 목록
  getOverdueAlerts: () => 
    apiClient.get<ApiResponse<any[]>>('/dashboard/overdue-alerts'),
};
