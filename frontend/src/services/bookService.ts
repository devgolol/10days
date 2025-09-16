import apiClient from './api';
import { Book, BookCreateRequest, ApiResponse, PageResponse } from '../types';

export const bookService = {
  // 모든 도서 조회
  getAll: () => 
    apiClient.get<ApiResponse<Book[]>>('/books'),

  // 도서 상세 조회
  getById: (id: number) => 
    apiClient.get<ApiResponse<Book>>(`/books/${id}`),

  // 도서 생성
  create: (book: BookCreateRequest) => 
    apiClient.post<ApiResponse<Book>>('/books', book),

  // 도서 수정
  update: (id: number, book: Partial<BookCreateRequest>) => 
    apiClient.put<ApiResponse<Book>>(`/books/${id}`, book),

  // 도서 삭제
  delete: (id: number) => 
    apiClient.delete<ApiResponse<void>>(`/books/${id}`),

  // 도서 검색
  search: (query: string) => 
    apiClient.get<ApiResponse<Book[]>>(`/books/search?q=${encodeURIComponent(query)}`),

  // 페이지네이션으로 도서 조회
  getPage: (page: number = 0, size: number = 10) => 
    apiClient.get<ApiResponse<PageResponse<Book>>>(`/books?page=${page}&size=${size}`),

  // 카테고리별 도서 조회
  getByCategory: (category: string) => 
    apiClient.get<ApiResponse<Book[]>>(`/books/category/${encodeURIComponent(category)}`),

  // 재고 확인
  checkAvailability: (id: number) => 
    apiClient.get<ApiResponse<{ available: boolean; availableCopies: number }>>(`/books/${id}/availability`),
};
