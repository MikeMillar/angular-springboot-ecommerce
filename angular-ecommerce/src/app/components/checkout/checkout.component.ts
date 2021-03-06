import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart-service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Lub2ShopValidators } from 'src/app/validators/lub2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = []
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
    private luv2ShopFormService: Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Lub2ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Lub2ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required,
                Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Lub2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Lub2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(5), Lub2ShopValidators.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Lub2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Lub2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(5), Lub2ShopValidators.notOnlyWhiteSpace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: new FormControl('', [Validators.required]),
        expirationYear: new FormControl('', [Validators.required])
      })
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );

    // populate credit card years
    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data;
      }
    )

    // populate countries
    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        this.countries = data;
        console.log(data);
        console.log(this.countries);
      }
    )

    this.reviewCartDetails();
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data;
      }
    );

    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
      }
    );
  }

  onSubmit() {
    // check for invalid errors
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderIterms from cartItems
    // - long way
    // let orderItems: OrderItem[] = [];
    // for (let i = 0; i < cartItems.length; i++) {
    //   orderItems.push(new OrderItem(cartItems[i]));
    // }

    // - short way
    let orderItems: OrderItem[] = cartItems.map(item => new OrderItem(item));

    // set up purchase
    let purchase = new Purchase();
    
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`)
          // reset cart ... todo
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    )

  }

  copyShippingAddressToBillingAddress(event: any) {

    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      // buf fix for states
      this.billingAddressStates = [];
    }

  }

  handleMonthsAndYears() {
    const creditCardFromGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFromGroup?.value.expirationYear);

    // if current year = selected year, then start with current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );

  }

  getStates(theFromGroup: string) {
    const formGroup = this.checkoutFormGroup.get(theFromGroup);
    const countryName = formGroup?.value.country;
    const country = this.countries.find(country => country.name === countryName);

    console.log(`Loading states for country: ${country!.name}, code: ${country!.code}`);

    this.luv2ShopFormService.getStates(country!.code).subscribe(
      data => {
        if (theFromGroup === 'shippingAddress') {
          this.shippingAddressStates = data
        } else {
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    )

  }

  resetCart() {
    // reset the cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form data
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  // Customer field get methods
  get firstName() {return this.checkoutFormGroup.get('customer.firstName')!;}
  get lastName() {return this.checkoutFormGroup.get('customer.lastName')!;}
  get email() {return this.checkoutFormGroup.get('customer.email')!;}

  // Shipping field get methods
  get shippingAddressStreet() {return this.checkoutFormGroup.get('shippingAddress.street')!;}
  get shippingAddressCity() {return this.checkoutFormGroup.get('shippingAddress.city')!;}
  get shippingAddressState() {return this.checkoutFormGroup.get('shippingAddress.state')!;}
  get shippingAddressCountry() {return this.checkoutFormGroup.get('shippingAddress.country')!;}
  get shippingAddressZipCode() {return this.checkoutFormGroup.get('shippingAddress.zipCode')!;}

  // billing field get methods
  get billingAddressStreet() {return this.checkoutFormGroup.get('billingAddress.street')!;}
  get billingAddressCity() {return this.checkoutFormGroup.get('billingAddress.city')!;}
  get billingAddressState() {return this.checkoutFormGroup.get('billingAddress.state')!;}
  get billingAddressCountry() {return this.checkoutFormGroup.get('billingAddress.country')!;}
  get billingAddressZipCode() {return this.checkoutFormGroup.get('billingAddress.zipCode')!;}

  // credit card field get methods
  get cardType() {return this.checkoutFormGroup.get('creditCard.cardType')!;}
  get nameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard')};
  get cardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber')};
  get securityCode() {return this.checkoutFormGroup.get('creditCard.securityCode')};
  get expirationMonth() {return this.checkoutFormGroup.get('creditCard.expirationMonth')};
  get expirationYear() {return this.checkoutFormGroup.get('creditCard.expirationYear')};



}
