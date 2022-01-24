package com.example.ecommerce.dao;

import com.example.ecommerce.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

/**
 * created by:
 * author: MichaelMillar
 * date: 1/23/2022
 */

public interface CustomerRepository extends JpaRepository<Customer, Long> {



}
