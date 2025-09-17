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

interface LoanCreateRequest {
  bookId: number;
  memberId: number;
}

export const loanService = {
  // 모든 대출 조회
  getAll: () => 
    apiClient.get<ApiResponse<Loan[]>>('/loans'),

  // 대출 상세 조회
  getById: (id: number) => 
    apiClient.get<ApiResponse<Loan>>(`/loans/${id}`),

  // 새 대출 생성
  create: (loan: LoanCreateRequest) => 
    apiClient.post<ApiResponse<Loan>>('/loans', loan),

  // 도서 반납
  returnBook: (id: number) => 
    apiClient.put<ApiResponse<Loan>>(`/loans/${id}/return`),

  // 대출 연장
  extend: (id: number, days: number = 14) => 
    apiClient.patch<ApiResponse<Loan>>(`/loans/${id}/extend`, { days }),

  // 분실 처리
  markAsLost: (id: number) => 
    apiClient.patch<ApiResponse<Loan>>(`/loans/${id}/lost`),

  // 대출 삭제
  delete: (id: number) => 
    apiClient.delete<ApiResponse<void>>(`/loans/${id}`),

  // 페이지네이션으로 대출 조회
  getPage: (page: number = 0, size: number = 10) => 
    apiClient.get<ApiResponse<PageResponse<Loan>>>(`/loans?page=${page}&size=${size}`),

  // 상태별 대출 조회
  getByStatus: (status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST') => 
    apiClient.get<ApiResponse<Loan[]>>(`/loans/status/${status}`),

  // 연체 대출 조회
  getOverdue: () => 
    apiClient.get<ApiResponse<Loan[]>>('/loans/overdue'),

  // 회원별 대출 조회
  getByMember: (memberId: number) => 
    apiClient.get<ApiResponse<Loan[]>>(`/loans/member/${memberId}`),

  // 도서별 대출 이력
  getByBook: (bookId: number) => 
    apiClient.get<ApiResponse<Loan[]>>(`/loans/book/${bookId}`),

  // 특정 기간 대출 조회
  getByDateRange: (startDate: string, endDate: string) => 
    apiClient.get<ApiResponse<Loan[]>>(`/loans/date-range?start=${startDate}&end=${endDate}`),

  // 대출 통계
  getStatistics: () => 
    apiClient.get<ApiResponse<{
      totalLoans: number;
      activeLoans: number;
      overdueLoans: number;
      returnedLoans: number;
      lostBooks: number;
      totalOverdueFees: number;
    }>>('/loans/statistics'),
};
