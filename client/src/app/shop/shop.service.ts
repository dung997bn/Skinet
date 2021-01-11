import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IPagination } from '../shared/models/pagination';
import { IBrand } from '../shared/models/brand';
import { IType } from '../shared/models/productType';
import { map } from 'rxjs/operators';
import { ShopParams } from '../shared/models/shopParams';
import { IProduct } from '../shared/models/product';
@Injectable({
  providedIn: 'root',
})
export class ShopService {
  baseurl = 'https://localhost:44350/api/';
  constructor(private http: HttpClient) { }

  getProducts(shopParams: ShopParams) {
    let params = new HttpParams();
    if (shopParams.brandId !== 0) {
      params = params.append('brandId', shopParams.brandId.toString());
    }
    if (shopParams.typeId !== 0) {
      params = params.append('typeId', shopParams.typeId.toString());
    }
    if (shopParams.sort) {
      params = params.append('sort', shopParams.sort);
    }
    params = params.append('pageIndex', shopParams.pageNumber.toString())
    params = params.append('pageSize', shopParams.pageSize.toString())

    if (shopParams.search) {
      params = params.append('search', shopParams.search);
    }
    return this.http
      .get<IPagination>(this.baseurl + 'products', {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          return response.body;
        }) 
      );
  }

  getProduct(id: string) {
    return this.http.get<IProduct>(this.baseurl + 'products/' + id)
  }

  getBrands() {
    return this.http.get<IBrand[]>(this.baseurl + 'products/brands');
  }

  getProductTypes() {
    return this.http.get<IType[]>(this.baseurl + 'products/types');
  }
}
