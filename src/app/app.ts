import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KhoService } from './services/kho';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  dsSanPham: any[] = [];

  constructor(
    private khoService: KhoService, 
    private cdr: ChangeDetectorRef // Cần cái này để cập nhật giao diện
  ) {}

  ngOnInit() {
    this.tailaiDuLieu();
  }

  tailaiDuLieu() {
    this.khoService.getProducts().subscribe((data: any) => {
      this.dsSanPham = data;
      this.cdr.detectChanges(); // Ép Angular vẽ lại bảng khi có dữ liệu
    });
  }

  // Đây là hàm mà HTML đang báo thiếu nè
  luuDuLieu(sp: any) {
    this.khoService.updateProduct(sp).subscribe(() => {
      alert('Đã cập nhật: ' + sp.name);
      this.cdr.detectChanges();
    });
  }
}