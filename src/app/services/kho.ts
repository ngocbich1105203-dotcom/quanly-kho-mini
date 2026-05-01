import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KhoService {
  // Link Web App URL của bạn
  private API_URL = 'https://script.google.com/macros/s/AKfycbyzDVXPhBJoso10WODeTYDbBFH6CUocIzh9mFA6G2r1HyGx1ZFVrCwZNhCiKK8JLty_/exec'; 

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách sản phẩm
   * @param date (Tùy chọn) Truyền vào ngày YYYY-MM-DD để lấy dữ liệu lịch sử
   */
  getProducts(date?: string): Observable<any> {
    // Nếu có truyền date, chúng ta thêm tham số vào URL để Google Script xử lý
    const url = date ? `${this.API_URL}?date=${date}` : this.API_URL;
    return this.http.get(url);
  }

  updateProduct(data: any): Observable<any> {
    return this.http.post(this.API_URL, JSON.stringify(data));
  }
}