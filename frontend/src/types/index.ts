// 백엔드 Entity 기반 TypeScript 타입 정의

export interface Book {
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

export interface Member {
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

export interface Loan {
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

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// 페이지네이션 타입
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 폼 데이터 타입 (생성용)
export interface BookCreateRequest {
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  category?: string;
  publishedDate?: string;
}

export interface MemberCreateRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface LoanCreateRequest {
  bookId: number;
  memberId: number;
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  recentLoans: Loan[];
}
