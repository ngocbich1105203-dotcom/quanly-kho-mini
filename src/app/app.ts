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
  selectedDate: string = new Date().toISOString().split('T')[0]; 
  isHistoryMode: boolean = false; 

  private readonly ADMIN_PASSWORD = '35doclap'; 

  constructor(private khoService: KhoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tailaiDuLieu();
  }

  onDateChange() {
    const today = new Date().toISOString().split('T')[0];
    if (this.selectedDate === today) {
      this.isHistoryMode = false;
      this.tailaiDuLieu();
    } else {
      this.isHistoryMode = true;
      this.taiLichSuTheoNgay(this.selectedDate);
    }
  }

  tailaiDuLieu() {
    this.isLoading = true;
    this.khoService.getProducts().subscribe((data: any) => {
      this.processData(data);
    }, () => this.isLoading = false);
  }

  taiLichSuTheoNgay(date: string) {
    this.isLoading = true;
    this.khoService.getProducts(date).subscribe((data: any) => {
      this.processData(data);
    }, () => {
      this.isLoading = false;
      alert("Không tìm thấy dữ liệu cho ngày này!");
    });
  }

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
    if (this.isHistoryMode) return;
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
    const dateStr = this.selectedDate.split('-').reverse().join('/');
    const pageWidth = doc.internal.pageSize.width;
    
    // 1. TRANG TRÍ HEADER CAO CẤP
    doc.setFillColor(41, 128, 185); // Màu xanh chủ đạo
    doc.rect(0, 0, pageWidth, 20, 'F'); // Thanh màu ngang đầu trang
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(this.removeVietnameseTones(this.tenCongTy), 14, 13);
    doc.text(`Ngay xuat: ${dateStr}`, pageWidth - 14, 13, { align: 'right' });

    // 2. TIÊU ĐỀ CHÍNH
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Màu xám đen sang trọng
    doc.text('BAO CAO DOANH THU KHO', pageWidth / 2, 40, { align: 'center' });
    
    // Vẽ một đường kẻ mảnh dưới tiêu đề
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 30, 45, pageWidth / 2 + 30, 45);

    // 3. CHUẨN BỊ DỮ LIỆU
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

    // 4. XUẤT BẢNG STYLE "PREMIUM"
    autoTable(doc, {
      head: [['Ten San Pham', 'Gia (VND)', 'Ton Dau', 'Nhap', 'Kiem', 'Da Ban', 'Thanh Tien']],
      body: dataForTable,
      startY: 55,
      theme: 'grid', // Dùng grid để nhìn rõ ràng từng ô
      headStyles: { 
        fillColor: [44, 62, 80], 
        textColor: 255, 
        fontSize: 9, 
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        minCellHeight: 10
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 50,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'right', fontStyle: 'bold', textColor: [192, 57, 43] } // Thành tiền màu đỏ đậm
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // 5. FOOTER TỔNG KẾT SANG TRỌNG
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Vẽ khung bo góc cho phần tổng tiền
    doc.setFillColor(236, 240, 241);
    doc.roundedRect(pageWidth - 90, finalY - 8, 76, 12, 2, 2, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('TONG DOANH THU:', pageWidth - 85, finalY);
    
    doc.setFontSize(13);
    doc.setTextColor(192, 57, 43); // Màu đỏ chuyên nghiệp cho con số cuối cùng
    doc.text(`${this.tinhTongDoanhThu().toLocaleString()} VND`, pageWidth - 16, finalY, { align: 'right' });

    // 6. CHỮ KÝ (Thêm vào cho giống báo cáo thật)
    const signatureY = finalY + 25;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Nguoi lap bieu', 35, signatureY);
    doc.text('(Ky va ghi ro ho ten)', 30, signatureY + 5);

    doc.save(`Bao-cao-doanh-thu-${this.selectedDate}.pdf`);
  }

  removeVietnameseTones(str: string): string {
    if (!str) return '';
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D');
  }
}