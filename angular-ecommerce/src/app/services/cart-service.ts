import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { CartItem } from "../common/cart-item";

@Injectable({
    providedIn: 'root'
  })
export class CartService {

    cartItems: CartItem[] = [];

    totalPrice: Subject<number> = new Subject<number>();
    totalQuantity: Subject<number> = new Subject<number>();

    constructor() { }

    addToCart(theCartItem: CartItem) {
        // check if we already have the item in our cart
        let alreadyExistsInCart: boolean = false;
        let existingCartItem: CartItem | undefined;

        if (this.cartItems.length > 0) {
            // find item in cart based on item id
            existingCartItem = this.cartItems.find(item => item.id === theCartItem.id);
        }

        // check if we found it
        alreadyExistsInCart = existingCartItem != undefined;
        if (alreadyExistsInCart) {
            // increment the quantity
            existingCartItem!.quantity++;
        } else {
            // add new cart item
            this.cartItems.push(theCartItem);
        }

        this.computeCartTotals();
    }

    remove(theCartItem: CartItem) {
        // get index of item in the array
        const itemIndex = this.cartItems.findIndex(
            item => item.id == theCartItem.id);

        // if found, remove item from array at given index
        if (itemIndex > -1) {
            this.cartItems.splice(itemIndex, 1);
        }

        // recalculate totals
        this.computeCartTotals();
    }

    computeCartTotals() {

        let totalPriceValue: number = 0;
        let totalQuantityValue: number = 0;

        for (let item of this.cartItems) {
            totalPriceValue += item.quantity * item.unitPrice;
            totalQuantityValue += item.quantity;
        }

        // publish the new values ... all subscribers will receive the new data
        this.totalPrice.next(totalPriceValue);
        this.totalQuantity.next(totalQuantityValue);
    }

    decrementQuantity(theCartItem: CartItem) {
        theCartItem.quantity--;

        if (theCartItem.quantity === 0) {
            this.remove(theCartItem);
        } else {
            this.computeCartTotals();
        }
    }

}
