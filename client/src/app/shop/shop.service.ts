import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IPagination } from '../shared/models/pagination';
import { IBrand } from '../shared/models/brand';
import { IType } from '../shared/models/productType';
import { map } from 'rxjs/operators';
import { ShopParams } from '../shared/models/shopParams';
import { IProduct } from '../shared/models/product';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ShopService {
  baseurl = environment.apiUrl;
  products: IProduct[] = [];
  brands: IBrand[] = [];
  types: IType[] = [];
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
    params = params.append('pageIndex', shopParams.pageNumber.toString());
    params = params.append('pageSize', shopParams.pageSize.toString());

    if (shopParams.search) {
      params = params.append('search', shopParams.search);
    }
    return this.http
      .get<IPagination>(this.baseurl + 'products', {
        observe: 'response',
        params,
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getProduct(id: string) {
    const product = this.products.find((p) => p.id === parseInt(id));
    if (product) {
      return of(product);
    }
    return this.http.get<IProduct>(this.baseurl + 'products/' + id);
  }

  getBrands() {
    if (this.brands.length > 0) {
      return of(this.brands);
    }
    return this.http.get<IBrand[]>(this.baseurl + 'products/brands').pipe(
      map((response: any) => {
        this.brands = response;
        return response;
      })
    );
  }

  getProductTypes() {
    if (this.types.length > 0) {
      return of(this.types);
    }
    return this.http.get<IType[]>(this.baseurl + 'products/types').pipe(
      map((response: any) => {
        this.types = response;
        return response;
      })
    );
  }
}
