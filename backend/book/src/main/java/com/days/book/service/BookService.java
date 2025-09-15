package com.days.book.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.days.book.entity.Book;
import com.days.book.repository.BookRepository;

@Service
@Transactional
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    //도서등록
    public Book saveBook(Book book) {
        
        if (book.getIsbn() != null && bookRepository.findByIsbn(book.getIsbn()).isPresent()) {
            throw new IllegalArgumentException("이미 등록된 ISBN입니다:" + book.getIsbn());
        }

        return bookRepository.save(book);
    }

    //도서 조회 (ID로)
    public Optional<Book> findBookById(Long id) {
        return bookRepository.findById(id);
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

    //도서 삭제
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 도서입니다: " +id));

        if (book.getAvailableCopies() < book.getTotalCopies()) {
            throw new IllegalStateException("현재 대출 중인 도서는 삭제할 수 없습니다.");
        }

        bookRepository.deleteById(id);
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
}
