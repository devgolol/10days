package com.days.book.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.days.book.entity.Book;
import com.days.book.repository.BookRepository;
import com.days.book.repository.LoanRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional
public class BookService {

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private LoanRepository loanRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    //도서등록
    public Book saveBook(Book book) {
        
        if (book.getIsbn() != null && bookRepository.findByIsbn(book.getIsbn()).isPresent()) {
            throw new IllegalArgumentException("이미 등록된 ISBN입니다:" + book.getIsbn());
        }
        
        // 새 책 등록 시 대출 가능 권수를 총 권수와 동일하게 설정
        if (book.getTotalCopies() != null && book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        
        // 기본값 설정 (null인 경우)
        if (book.getTotalCopies() == null) {
            book.setTotalCopies(1);
            book.setAvailableCopies(1);
        }

        return bookRepository.save(book);
    }

    //도서 조회 (ID로)
    public Optional<Book> findBookById(Long id) {
        return bookRepository.findById(id);
    }

    //도서 조회 (ID로) - LoanService용
    public Book getBook(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("도서를 찾을 수 없습니다. ID: " + id));
    }

    //도서 조회(ISBN으로)
    public Optional<Book> findBookByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn);
    }

    //모든 도서 조회
    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    //제목으로 도서 검색
    public List<Book> searchBooksByTitle(String title) {
        return bookRepository.findByTitleContaining(title);
    }

    //저자로 도서 검색
    public List<Book> searchBooksByAuthor(String author) {
        return bookRepository.findByAuthorContaining(author);
    }

    //키워드로 도서 검색(제목 + 저자)
    public List<Book> searchBooksByKeyword(String keyword) {
        if(keyword == null || keyword.trim().isEmpty()) {
            return findAllBooks();
        }
        return bookRepository.findByKeyword(keyword.trim());
    }

    //카테고리별 도서 조회
    public List<Book> findBooksByCategory(String category) {
        return bookRepository.findByCategory(category);
    }

    //대출 가능한 도서 조회
    public List<Book> findAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0);
    }

    //재고 부족 도서 조회
    public List<Book> findOutOfStockBooks() {
        return bookRepository.findOutOfStockBooks();
    }

    //도서 정보 수정
    public Book updateBook(Long id, Book updatedBook) {
        Book existingBook = bookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않은 도서입니다:" + id));

            if(updatedBook.getIsbn() != null &&
                !updatedBook.getIsbn().equals(existingBook.getIsbn()) &&
                bookRepository.findByIsbn(updatedBook.getIsbn()).isPresent()) {
                    throw new IllegalArgumentException("이미 등록된 ISBN입니다." + updatedBook.getIsbn());
                }

                existingBook.setTitle(updatedBook.getTitle());
                existingBook.setAuthor(updatedBook.getAuthor());
                existingBook.setIsbn(updatedBook.getIsbn());
                existingBook.setCategory(updatedBook.getCategory());
                existingBook.setPublisher(updatedBook.getPublisher());
                existingBook.setPublishedDate(updatedBook.getPublishedDate());
                existingBook.setDescription(updatedBook.getDescription());

                if(updatedBook.getTotalCopies() != null) {
                    updateBookCopies(id, updatedBook.getTotalCopies());
                }
                return bookRepository.save(existingBook);
            }

    //도서 정보 수정 (Book 객체로) - LoanService용
    public Book updateBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBookCopies (Long id, Integer newTotalCopies) {
        Book book = bookRepository.findById(id)
        .orElseThrow(() ->  new IllegalArgumentException("존재하지 않는 도서입니다:" + id));

        if(newTotalCopies < 0) {
            throw new IllegalArgumentException("총 수량은 0보다 작을 수 없습니다.");
        }

        int loanedCopies = book.getTotalCopies() - book.getAvailableCopies();

        if (newTotalCopies < loanedCopies) {
            throw new IllegalArgumentException("새로운 총 수량이 현재 대출된 수량보다 작습니다." +
            "현재 대출된 수량: " + loanedCopies);
        }

        book.setTotalCopies(newTotalCopies);
        book.setAvailableCopies(newTotalCopies - loanedCopies);

        return bookRepository.save(book);
    }

    //도서 삭제 (폐기처분/분실 등의 경우, 대출기록은 보존)
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 도서입니다: " +id));

        // 현재 대출 중인 도서 삭제 불가 검증
        int loanedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (loanedCopies > 0) {
            throw new IllegalStateException("현재 " + loanedCopies + "권이 대출 중이므로 도서를 삭제할 수 없습니다. 모든 도서가 반납된 후 삭제해주세요.");
        }

        try {
            // 1단계: 관련된 과거 대출 기록의 book 참조를 해제 (기록은 보존)
            loanRepository.updateBookToNullByBookId(id);
            
            // 2단계: 이제 안전하게 도서 삭제 (폐기처분/분실 처리)
            bookRepository.deleteById(id);
        } catch (Exception e) {
            throw new IllegalStateException("도서 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    public List<Book> findPopularBooks() {
        return bookRepository.findPopularBooks();
    }


    public boolean existtById(Long id) {
        return bookRepository.existsById(id);
    }

    public long countAllBooks() {
        return bookRepository.count();
    }

    // DashboardController용 메서드
    public long getTotalBooksCount() {
        return bookRepository.count();
    }
    
    // 임시 메서드: 데이터베이스 스키마 수정 (book_id 컬럼을 nullable로 변경)
    @Transactional
    public String fixLoanTableSchema() {
        try {
            // loans 테이블의 book_id 컬럼을 nullable로 변경
            entityManager.createNativeQuery("ALTER TABLE loans MODIFY COLUMN book_id BIGINT NULL").executeUpdate();
            return "스키마 수정 완료: loans.book_id 컬럼이 nullable로 변경되었습니다.";
        } catch (Exception e) {
            return "스키마 수정 실패: " + e.getMessage();
        }
    }
}
