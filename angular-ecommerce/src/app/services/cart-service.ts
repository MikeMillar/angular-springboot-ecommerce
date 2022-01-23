import { Subject } from "rxjs";
import { CartItem } from "../common/cart-item";

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

}
