package com.example.ecommerce.dao;

import com.example.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * created by:
 * author: MichaelMillar
 * date: 1/20/2022
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

}
