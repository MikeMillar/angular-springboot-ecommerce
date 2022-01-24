package com.example.ecommerce.dto;

import com.example.ecommerce.entity.Address;
import com.example.ecommerce.entity.Customer;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

/**
 * created by:
 * author: MichaelMillar
 * date: 1/23/2022
 */

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

}
