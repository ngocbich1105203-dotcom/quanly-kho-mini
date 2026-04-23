import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KhoService } from './services/kho';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  dsSanPham: any[] = [];
  isLoading: boolean = false;
  currentTab: string = 'nhap';
  private readonly ADMIN_PASSWORD = '9999'; // Mật khẩu của bạn

  constructor(private khoService: KhoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tailaiDuLieu();
  }

  // Hàm mở tab quản lý - Click vào icon để gọi
  moTabQuanLy() {
    const pass = prompt("Xác thực quyền quản lý:");
    if (pass === this.ADMIN_PASSWORD) {
      this.currentTab = 'admin';
      this.cdr.detectChanges();
    } else if (pass !== null) {
      alert("Sai mã!");
    }
  }

  tailaiDuLieu() {
    this.isLoading = true;
    this.khoService.getProducts().subscribe((data: any) => {
      this.dsSanPham = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        gia: Number(item.gia) || 0,
        tonDau: Number(item.tonDau) || 0,
        nhapHang: Number(item.nhapHang) || 0,
        kiemHang: Number(item.kiemHang) || 0
      }));
      this.isLoading = false;
      this.cdr.detectChanges();
    }, () => this.isLoading = false);
  }

  luuDuLieu(sp: any) {
    this.khoService.updateProduct(sp).subscribe(() => {
      alert('Đã cập nhật: ' + sp.name);
      this.tailaiDuLieu();
    });
  }

  tinhTongTien() {
    return this.dsSanPham.reduce((sum, sp) => {
      return sum + ((sp.kiemHang || 0) * (sp.gia || 0));
    }, 0);
  }

  exportToPDF() {
    const doc = new jsPDF();
    doc.text('BAO CAO KIEM KHO', 105, 20, { align: 'center' });
    const dataForTable = this.dsSanPham.map(sp => [
      this.removeVietnameseTones(sp.name), sp.gia, sp.tonDau, sp.nhapHang, sp.kiemHang
    ]);
    autoTable(doc, {
      head: [['Ten SP', 'Gia', 'Ton Dau', 'Nhap', 'Kiem']],
      body: dataForTable,
      startY: 30
    });
    doc.save(`Kho_Bich.pdf`);
  }

  removeVietnameseTones(str: string): string {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
}