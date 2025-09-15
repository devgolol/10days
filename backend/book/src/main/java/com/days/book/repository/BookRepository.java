package com.days.book.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.days.book.entity.Book;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>{

    Optional<Book> findByIsbn(String isbn);

    List<Book> findByTitleContaining(String title);

    List<Book> findByAuthorContaining(String author);

    List<Book> findByCategory(String category);

    List<Book> findByPublisher(String publisher);

    List<Book> findByAvailableCopiesGreaterThan(Integer copies);

    List<Book> findByTitleContainingAndAuthorContaining(String title, String author);

    @Query("SELECT b FROM Book b WHERE b.title LIKE %:keyword% OR b.author LIKE %:keyword%")
    List<Book> findByKeyword(@Param("keyword") String keyword);

    @Query("SELECT b FROM Book b WHERE b.availableCopies = 0")
    List<Book> findOutOfStockBooks();

    @Query("SELECT b FROM Book b LEFT JOIN Loan l ON b.id = l.book.id " +
           "GROUP BY b.id ORDER BY COUNT(l.id) DESC")
    List<Book> findPopularBooks();
}
