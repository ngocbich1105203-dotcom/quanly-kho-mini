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
  
  // --- QUẢN LÝ NGÀY THÁNG ---
  tenCongTy: string = 'DONG QUAN PHU'; 
  // selectedDate dùng để binding với input type="date", định dạng YYYY-MM-DD
  selectedDate: string = new Date().toISOString().split('T')[0]; 
  isHistoryMode: boolean = false; // Trạng thái xem dữ liệu cũ

  private readonly ADMIN_PASSWORD = '35doclap'; 

  constructor(private khoService: KhoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tailaiDuLieu();
  }

  /**
   * Xử lý khi thay đổi ngày trên lịch
   */
  onDateChange() {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.selectedDate === today) {
      this.isHistoryMode = false;
      this.tailaiDuLieu(); // Load dữ liệu hiện tại
    } else {
      this.isHistoryMode = true;
      this.taiLichSuTheoNgay(this.selectedDate); // Load lịch sử
    }
  }

  /**
   * Lấy dữ liệu hiện tại (Sheet Current)
   */
  tailaiDuLieu() {
    this.isLoading = true;
    this.khoService.getProducts().subscribe((data: any) => {
      this.processData(data);
    }, () => this.isLoading = false);
  }

  /**
   * Lấy dữ liệu lịch sử theo ngày (Sheet History)
   * Lưu ý: Bạn cần thêm hàm getHistoryByDate(date) vào KhoService
   */
  taiLichSuTheoNgay(date: string) {
    this.isLoading = true;
    // Giả sử service của bạn có hàm getHistory(date)
    // Nếu chưa có, bạn có thể truyền thêm action vào getProducts
    this.khoService.getProducts(date).subscribe((data: any) => {
      this.processData(data);
    }, () => {
      this.isLoading = false;
      alert("Không tìm thấy dữ liệu cho ngày này!");
    });
  }

  /**
   * Xử lý dữ liệu trả về từ API
   */
  private processData(data: any) {
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

  luuTatCa() {
    if (this.isHistoryMode) return; // Không cho lưu khi đang xem lịch sử

    this.isLoading = true;
    this.khoService.updateProduct(this.dsSanPham).subscribe({
      next: () => {
        alert('Đã lưu dữ liệu thành công! 🎉');
        this.tailaiDuLieu();
      },
      error: () => { 
        this.isLoading = false; 
        alert('Lỗi khi lưu!'); 
      }
    });
  }

  tinhSoLuongDaBan(sp: any): number {
    const daBan = (sp.tonDau + sp.nhapHang) - sp.kiemHang;
    return daBan > 0 ? daBan : 0;
  }

  tinhTongDoanhThu() {
    return this.dsSanPham.reduce((sum, sp) => {
      const soLuongBan = this.tinhSoLuongDaBan(sp);
      return sum + (soLuongBan * (sp.gia || 0));
    }, 0);
  }

  exportToPDF() {
    const doc = new jsPDF();
    
    doc.setFontSize(10);
    doc.text(this.removeVietnameseTones(this.tenCongTy), 14, 10);
    // Hiển thị ngày đã chọn trên PDF
    doc.text(`Ngay: ${this.selectedDate.split('-').reverse().join('/')}`, 160, 10);

    doc.setFontSize(18);
    doc.text('BAO CAO DOANH THU KHO', 105, 25, { align: 'center' });
    
    const dataForTable = this.dsSanPham.map(sp => {
      const daBan = this.tinhSoLuongDaBan(sp);
      const thanhTien = daBan * sp.gia;
      return [
        this.removeVietnameseTones(sp.name), 
        sp.gia.toLocaleString(), 
        sp.tonDau, 
        sp.nhapHang, 
        sp.kiemHang,
        daBan,
        thanhTien.toLocaleString()
      ];
    });

    autoTable(doc, {
      head: [['Ten SP', 'Gia', 'Ton Dau', 'Nhap', 'Kiem', 'Da Ban', 'Thanh Tien']],
      body: dataForTable,
      startY: 35,
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`TONG DOANH THU: ${this.tinhTongDoanhThu().toLocaleString()} VND`, 14, finalY);

    doc.save(`Doanh-thu-${this.selectedDate}.pdf`);
  }

  removeVietnameseTones(str: string): string {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
}