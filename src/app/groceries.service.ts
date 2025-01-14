import { Injectable } from '@angular/core';
import {Observable, Subscription} from "rxjs";
import { HttpClient } from '@angular/common/http';
import { Item } from "./models/item";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GroceriesService {
  groceriesAvailable: Item[] = [];
  cart: Map<Item, number> = new Map<Item, number>;
  totalPrice: number = 0;
  private subscription: Subscription | null = null;

  constructor(private readonly http: HttpClient) {
    this.subscription = this.getGroceries().subscribe((items: Item[]) => {
      items.forEach((item: Item) => this.groceriesAvailable.push(item))
    })
  }

  destructor() {
    if(this.subscription)
      this.subscription.unsubscribe();
  }

  getGroceries(): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.apiUrl}`)
  }

  updateTotalPrice(change: number) {
    this.totalPrice = Math.round((this.totalPrice + change) * 100) / 100
  }

  addToCart(item: Item) {
    if(this.cart.has(item))
      return;

    this.cart.set(item, 1);
    this.updateTotalPrice(item.price);
  }

  incrementQuantity(item: Item) {
    if(!this.cart.has(item))
      return;

    const oldQuantity: number | undefined = this.cart.get(item);
    if(oldQuantity) {
      this.cart.set(item, oldQuantity + 1)
      this.updateTotalPrice(item.price);
    }
  }

  decrementQuantity(item: Item) {
    if(!this.cart.has(item))
      return;

    const oldQuantity: number | undefined = this.cart.get(item);
    if(!oldQuantity) return;

    this.updateTotalPrice(-item.price);
    if(oldQuantity === 1) {
      this.cart.delete(item)
      return;
    }

    this.cart.set(item, oldQuantity - 1)
  }
}
