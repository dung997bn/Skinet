import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BasketService } from 'src/app/basket/basket.service';
import { IBasket } from 'src/app/shared/models/basket';
import { IOrder, IOrderToCreate } from 'src/app/shared/models/order';
import { CheckoutService } from '../checkout.service';

declare var Stripe: any;

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss'],
})
export class CheckoutPaymentComponent implements AfterViewInit, OnDestroy {
  @Input() checkoutForm: FormGroup;
  @ViewChild('cardNumber', { static: true }) cardNumberElement: ElementRef;
  @ViewChild('cardExpiry', { static: true }) cardExpiryElement: ElementRef;
  @ViewChild('cardCvc', { static: true }) cardCvcElement: ElementRef;
  stripe: any;
  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;
  cardErrors: any;
  cardHandle = this.onChange.bind(this);
  loading = false
  cardNumberValid = false
  cardExpiryValid = false
  cardCvcValid = false

  constructor(
    private basketService: BasketService,
    private toastr: ToastrService,
    private checkoutService: CheckoutService,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    this.stripe = Stripe(
      'pk_test_51IAZBtKw1mDOZAENzNtaxJUNattwVBez7ilkusBUp5nLkZAbYgN7sB9rjtMHqS9SNgJm6Q8EhESWtVSkQpvMUV4h00LEtkjBLw'
    );
    const elements = this.stripe.elements();

    this.cardNumber = elements.create('cardNumber');
    this.cardNumber.mount(this.cardNumberElement.nativeElement);
    this.cardNumber.addEventListener('change', this.cardHandle);

    this.cardExpiry = elements.create('cardExpiry');
    this.cardExpiry.mount(this.cardExpiryElement.nativeElement);
    this.cardExpiry.addEventListener('change', this.cardHandle);

    this.cardCvc = elements.create('cardCvc');
    this.cardCvc.mount(this.cardCvcElement.nativeElement);
    this.cardCvc.addEventListener('change', this.cardHandle);
  }

  ngOnDestroy() {
    this.cardNumber.destroy();
    this.cardExpiry.destroy();
    this.cardCvc.destroy();
  }

  onChange(event: any) {
    if (event.error) {
      this.cardErrors = event.error.message;
    } else {
      this.cardErrors = null;
    }
    switch (event.elementType) {
      case "cardNumber":
        this.cardNumberValid = event.complete
        break;
      case "cardExpiry":
        this.cardExpiryValid = event.complete
        break;
      case "cardCvc":
        this.cardCvcValid = event.complete
        break;
      default:
        break;
    }
  }

  getOrderToCreate(basket: IBasket): IOrderToCreate {
    return {
      basketId: basket.id,
      deliveryMethodId: parseInt(
        this.checkoutForm.get('deliveryForm')?.value.deliveryMethod
      ),
      shipToAddress: this.checkoutForm.get('addressForm')?.value,
    };
  }

  private async createOrder(basket: IBasket) {
    const orderToCreate = this.getOrderToCreate(basket);
    return this.checkoutService.creatOrder(orderToCreate).toPromise()
  }

  private async confirmPaymentWithStripe(basket: IBasket) {
    return this.stripe.confirmCardPayment(basket.clientSecret, {
      payment_method: {
        card: this.cardNumber,
        billing_details: {
          name: this.checkoutForm.get('paymentForm')?.get('nameOnCard')?.value
        }
      }
    });
  }

  async submitOrder() {
    this.loading = true
    const basket = this.basketService.getCurrentBasketValue();
    try {
      const createdOrder = await this.createOrder(basket)
      const paymentResult = await this.confirmPaymentWithStripe(basket);

      if (paymentResult.paymentIntent) {
        this.basketService.deleteBasket(basket);
        const navigationExtras: NavigationExtras = { state: createdOrder };
        this.router.navigate(['checkout/success'], navigationExtras);

      } else {
        this.toastr.error(paymentResult.error.message)
      }
      this.loading = false
    } catch (error) {
      console.log(error);
      this.toastr.error(error.message)
      this.loading = false
    }
  }
}
