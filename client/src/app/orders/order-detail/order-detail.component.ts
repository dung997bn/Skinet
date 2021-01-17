import { IOrder } from 'src/app/shared/models/order';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order: IOrder;
  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private ordersService: OrdersService
  ) {
    this.breadcrumbService.set('@OrderDetail', '');
  }

  ngOnInit() {
    this.ordersService
      .getOrderDetailed(parseInt(this.route.snapshot.paramMap.get('id')!))
      .subscribe(
        (order: any) => {
          this.order = order;
          this.breadcrumbService.set(
            '@OrderDetail',
            `Order# ${order.id} - ${order.status}`
          );
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
