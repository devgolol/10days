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

interface BookCreateRequest {
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  category?: string;
  publishedDate?: string;
}

export const bookService = {
  // 모든 도서 조회
  getAll: () => 
    apiClient.get<Book[]>('/books'),

  // 도서 상세 조회
  getById: (id: number) => 
    apiClient.get<Book>(`/books/${id}`),

  // 도서 생성
  create: (book: BookCreateRequest) => 
    apiClient.post<Book>('/books', book),

  // 도서 수정
  update: (id: number, book: Partial<BookCreateRequest>) => 
    apiClient.put<Book>(`/books/${id}`, book),

  // 도서 삭제
  delete: (id: number) => 
    apiClient.delete(`/books/${id}`),

  // 도서 검색
  search: (query: string) => 
    apiClient.get<Book[]>(`/books/search?keyword=${encodeURIComponent(query)}`),

  // 페이지네이션으로 도서 조회
  getPage: (page: number = 0, size: number = 10) => 
    apiClient.get<Book[]>(`/books?page=${page}&size=${size}`),

  // 카테고리별 도서 조회
  getByCategory: (category: string) => 
    apiClient.get<Book[]>(`/books/category/${encodeURIComponent(category)}`),

  // 재고 확인
  checkAvailability: (id: number) => 
    apiClient.get<{ available: boolean; availableCopies: number }>(`/books/${id}/availability`),
};
