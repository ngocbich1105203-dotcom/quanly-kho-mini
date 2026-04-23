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
  
  // --- THÔNG TIN THÊM MỚI ---
  tenCongTy: string = 'DONG QUAN PHU'; // Bích có thể đổi tên công ty ở đây
  ngayHienTai: string = new Date().toLocaleDateString('vi-VN');
  private readonly ADMIN_PASSWORD = '35doclap'; 

  constructor(private khoService: KhoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tailaiDuLieu();
  }

  moTabQuanLy() {
    const pass = prompt("Xác thực quyền quản lý:");
    if (pass === this.ADMIN_PASSWORD) {
      this.currentTab = 'admin';
      this.cdr.detectChanges();
    } else if (pass !== null) {
      alert("Mật khẩu không đúng!");
    }
  }

  tailaiDuLieu() {
    this.isLoading = true;
    this.khoService.getProducts().subscribe((data: any) => {
      this.dsSanPham = data.map((item: any) => ({
        id: item.id, name: item.name, gia: Number(item.gia) || 0,
        tonDau: Number(item.tonDau) || 0, nhapHang: Number(item.nhapHang) || 0,
        kiemHang: Number(item.kiemHang) || 0
      }));
      this.isLoading = false;
      this.cdr.detectChanges();
    }, () => this.isLoading = false);
  }

  luuTatCa() {
    this.isLoading = true;
    this.khoService.updateProduct(this.dsSanPham).subscribe({
      next: () => {
        alert('Đã lưu dữ liệu thành công! 🎉');
        this.tailaiDuLieu();
      },
      error: () => { this.isLoading = false; alert('Lỗi khi lưu!'); }
    });
  }

  exportToPDF() {
    const doc = new jsPDF();
    
    // Thêm Tên Công Ty và Ngày Tháng vào PDF
    doc.setFontSize(10);
    doc.text(this.removeVietnameseTones(this.tenCongTy), 14, 10);
    doc.text(`Ngay: ${this.ngayHienTai}`, 160, 10);

    doc.setFontSize(18);
    doc.text('BAO CAO KIEM KHO', 105, 25, { align: 'center' });
    
    const dataForTable = this.dsSanPham.map(sp => [
      this.removeVietnameseTones(sp.name), sp.gia, sp.tonDau, sp.nhapHang, sp.kiemHang
    ]);

    autoTable(doc, {
      head: [['Ten SP', 'Gia', 'Ton Dau', 'Nhap', 'Kiem']],
      body: dataForTable,
      startY: 35,
      theme: 'striped'
    });
    doc.save(`Bao-cao-kho-${this.ngayHienTai.replace(/\//g, '-')}.pdf`);
  }

  tinhTongTien() {
    return this.dsSanPham.reduce((sum, sp) => sum + ((sp.kiemHang || 0) * (sp.gia || 0)), 0);
  }

  removeVietnameseTones(str: string): string {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
}