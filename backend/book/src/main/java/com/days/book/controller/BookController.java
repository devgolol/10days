package com.days.book.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.days.book.entity.Book;
import com.days.book.service.BookService;

import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"})
public class BookController {

    private final BookService bookService;

    //전체 도서 조회 (모든 인증된 사용자)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.findAllBooks();
        return ResponseEntity.ok(books);
    }

    //특정 도서 조회 (모든 인증된 사용자)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Book> getBook(@PathVariable("id") Long id) {
        try{
            Book book = bookService.getBook(id);
            return ResponseEntity.ok(book);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    //도서 등록 (관리자만)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book) {
        try {
            Book savedBook = bookService.saveBook(book);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedBook);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    //도서 정보 수정 (관리자만)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> updateBook(@PathVariable("id") Long id, @Valid @RequestBody Book book) {
        try {
            Book updateBook = bookService.updateBook(id,book);
            return ResponseEntity.ok(updateBook);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    //도서 삭제 (관리자만)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteBook(@PathVariable("id") Long id) {
        try {
            bookService.deleteBook(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            // 도서가 존재하지 않는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("도서를 찾을 수 없습니다: " + e.getMessage());
        } catch (IllegalStateException e) {
            // 대출 중이거나 대출 기록이 있어 삭제 불가능한 경우
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(e.getMessage());
        } catch (Exception e) {
            // 기타 예상하지 못한 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("도서 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    //키워드로 도서 검색 (모든 인증된 사용자)
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<List<Book>> searchBooks (@RequestParam String keyword) {
        List<Book> books = bookService.searchBooksByKeyword(keyword);
        return ResponseEntity.ok(books);
    }

    //제목으로 도서 검색
    @GetMapping("/search/title")
    public ResponseEntity<List<Book>> searchBooksByTitle(@RequestParam String title) {
        List<Book> books = bookService.searchBooksByTitle(title);
        return ResponseEntity.ok(books);
    }

    //저자로 도서 검색
    @GetMapping("/search/author")
    public ResponseEntity<List<Book>> searchBooksByAuthor(@RequestParam String author) {
        List<Book> books = bookService.searchBooksByAuthor(author);
        return ResponseEntity.ok(books);
    }

    //ISBN으로 도서 조회
    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<Book> getBookByIsbn(@PathVariable String isbn) {
        return bookService.findBookByIsbn(isbn)
        .map(book -> ResponseEntity.ok(book)) //질문1
        .orElse(ResponseEntity.notFound().build());
    }

    //카테고리별 도서 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        List<Book> books = bookService.findBooksByCategory(category);
        return ResponseEntity.ok(books);
    }

    //대출 가능한 도서 조회
    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAbailableBooks() {
        List<Book> books = bookService.findAvailableBooks();
        return ResponseEntity.ok(books);
    }

    //재고 부족 도서 조회
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Book>> getOutOfStockBooks() {
        List<Book> books = bookService.findOutOfStockBooks();
        return ResponseEntity.ok(books);
    }

    //인기 도서 조회
    @GetMapping("/popular")
    public ResponseEntity<List<Book>> getPopularBooks() {
        List<Book> books = bookService.findPopularBooks();
        return ResponseEntity.ok(books);
    }

    //도서 재고 수정
    @PutMapping("/{id}/copies")
    public ResponseEntity<Book>updateBooCopies(@PathVariable Long id, @RequestParam Integer totalCopies) {
        try {
            Book updatedBook = bookService.updateBookCopies(id, totalCopies);
            return ResponseEntity.ok(updatedBook);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    //도서 존재 여부 확인
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> bookExists(@PathVariable Long id) {
        boolean exists = bookService.existtById(id);
        return ResponseEntity.ok(exists);
    }

    //전체 도서 수 조회
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalBookCount() {
        long count = bookService.countAllBooks();
        return ResponseEntity.ok(count);
    }
    
    // 임시 엔드포인트: 스키마 수정 (loans 테이블 book_id를 nullable로 변경)
    @PostMapping("/fix-schema")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> fixSchema() {
        String result = bookService.fixLoanTableSchema();
        return ResponseEntity.ok(result);
    }

}
