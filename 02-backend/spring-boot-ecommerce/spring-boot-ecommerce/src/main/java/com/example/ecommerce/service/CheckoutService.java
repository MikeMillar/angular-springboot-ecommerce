package com.example.ecommerce.service;

import com.example.ecommerce.dto.Purchase;
import com.example.ecommerce.dto.PurchaseResponse;

/**
 * created by:
 * author: MichaelMillar
 * date: 1/23/2022
 */
public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

}
