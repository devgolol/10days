import dayjs from 'dayjs';

// 날짜 포맷팅
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD') => {
  return dayjs(date).format(format);
};

// 날짜와 시간 포맷팅
export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 상대적 시간 (몇 분 전, 몇 시간 전)
export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

// 연체일 계산
export const calculateOverdueDays = (dueDate: string | Date) => {
  const due = dayjs(dueDate);
  const now = dayjs();
  const diff = now.diff(due, 'day');
  return diff > 0 ? diff : 0;
};

// 연체 여부 확인
export const isOverdue = (dueDate: string | Date, returnDate?: string | Date) => {
  if (returnDate) return false; // 이미 반납됨
  const due = dayjs(dueDate);
  const now = dayjs();
  return now.isAfter(due);
};

// 연체료 계산 (하루에 100원)
export const calculateOverdueFee = (dueDate: string | Date, returnDate?: string | Date) => {
  const days = calculateOverdueDays(dueDate);
  if (returnDate) {
    // 반납됐으면 반납일까지만 계산
    const returnDay = dayjs(returnDate);
    const due = dayjs(dueDate);
    const overdueDays = returnDay.diff(due, 'day');
    return overdueDays > 0 ? overdueDays * 100 : 0;
  }
  return days * 100;
};

// 숫자를 천단위 콤마로 포맷팅
export const formatNumber = (num: number) => {
  return num.toLocaleString();
};

// 원화 포맷팅
export const formatCurrency = (amount: number) => {
  return `₩${amount.toLocaleString()}`;
};

// 문자열이 비어있는지 확인
export const isEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim() === '';
};

// 이메일 형식 검증
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 전화번호 형식 검증 (한국)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// ISBN 형식 검증
export const isValidISBN = (isbn: string): boolean => {
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  return cleanISBN.length === 10 || cleanISBN.length === 13;
};

// 에러 메시지 추출
export const getErrorMessage = (error: any): string => {
  // axios 응답 에러의 경우
  if (error.response) {
    // 서버에서 직접 문자열로 응답하는 경우 (우리의 경우)
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    // JSON 응답의 경우
    if (error.response.data?.message) {
      return error.response.data.message;
    }
    // 상태 코드별 기본 메시지
    switch (error.response.status) {
      case 400:
        return '잘못된 요청입니다.';
      case 401:
        return '인증이 필요합니다.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 409:
        return '요청이 현재 리소스 상태와 충돌합니다.';
      case 500:
        return '서버 내부 오류가 발생했습니다.';
      default:
        return `오류가 발생했습니다. (상태 코드: ${error.response.status})`;
    }
  }
  
  // 네트워크 오류 등
  if (error.message) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

// 파일 크기 포맷팅
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 배열에서 중복 제거
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};
