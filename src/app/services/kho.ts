import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KhoService {
  // Thay cái link dưới đây bằng link Web App URL của bạn
  private API_URL = 'https://script.google.com/macros/s/AKfycbyzDVXPhBJoso10WODeTYDbBFH6CUocIzh9mFA6G2r1HyGx1ZFVrCwZNhCiKK8JLty_/exec'; 

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any> {
    return this.http.get(this.API_URL);
  }

  updateProduct(data: any): Observable<any> {
    return this.http.post(this.API_URL, JSON.stringify(data));
  }
}