import apiClient from './api';

// 로컬 타입 정의
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  category?: string;
  publishedDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: number;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Loan {
  id: number;
  book: Book;
  member: Member;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';
  overdueFee: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  recentLoans: Loan[];
}

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
