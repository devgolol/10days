import apiClient from './api';
import { Member, MemberCreateRequest, ApiResponse, PageResponse } from '../types';

export const memberService = {
  // 모든 회원 조회
  getAll: () => 
    apiClient.get<ApiResponse<Member[]>>('/members'),

  // 회원 상세 조회
  getById: (id: number) => 
    apiClient.get<ApiResponse<Member>>(`/members/${id}`),

  // 회원번호로 조회
  getByMemberNumber: (memberNumber: string) => 
    apiClient.get<ApiResponse<Member>>(`/members/number/${memberNumber}`),

  // 회원 생성
  create: (member: MemberCreateRequest) => 
    apiClient.post<ApiResponse<Member>>('/members', member),

  // 회원 수정
  update: (id: number, member: Partial<MemberCreateRequest>) => 
    apiClient.put<ApiResponse<Member>>(`/members/${id}`, member),

  // 회원 삭제
  delete: (id: number) => 
    apiClient.delete<ApiResponse<void>>(`/members/${id}`),

  // 회원 검색 (이름, 이메일로)
  search: (query: string) => 
    apiClient.get<ApiResponse<Member[]>>(`/members/search?q=${encodeURIComponent(query)}`),

  // 페이지네이션으로 회원 조회
  getPage: (page: number = 0, size: number = 10) => 
    apiClient.get<ApiResponse<PageResponse<Member>>>(`/members?page=${page}&size=${size}`),

  // 회원 상태별 조회
  getByStatus: (status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') => 
    apiClient.get<ApiResponse<Member[]>>(`/members/status/${status}`),

  // 회원 상태 변경
  updateStatus: (id: number, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') => 
    apiClient.patch<ApiResponse<Member>>(`/members/${id}/status`, { status }),

  // 회원 대출 이력 조회
  getLoanHistory: (id: number) => 
    apiClient.get<ApiResponse<any[]>>(`/members/${id}/loans`),
};
