import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BasketService } from 'src/app/basket/basket.service';
import { IBasket } from 'src/app/shared/models/basket';
import { IOrder, IOrderToCreate } from 'src/app/shared/models/order';
import { CheckoutService } from '../checkout.service';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss'],
})
export class CheckoutPaymentComponent implements OnInit {
  @Input() checkoutForm: FormGroup;
  constructor(
    private basketService: BasketService,
    private toastr: ToastrService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  getOrderToCreate(basket: IBasket): IOrderToCreate {
    return {
      basketId: basket.id,
      deliveryMethodId: parseInt(this.checkoutForm.get('deliveryForm')?.value.deliveryMethod),
      shipToAddress: this.checkoutForm.get('addressForm')?.value,
    };
  }

  submitOrder() {
    const basket = this.basketService.getCurrentBasketValue();
    const orderToCreate = this.getOrderToCreate(basket);
    this.checkoutService.creatOrder(orderToCreate).subscribe(
      (order: IOrder) => {
        this.toastr.success('Order created successfully!');
        const navigationExtras: NavigationExtras = { state: order };
        this.router.navigate(['checkout/success'], navigationExtras);
        this.basketService.deleteLocalBasket(basket.id);
        console.log(order);
      },
      (error) => {
        console.log(error);
        this.toastr.error(error.message);
      }
    );
  }
}
