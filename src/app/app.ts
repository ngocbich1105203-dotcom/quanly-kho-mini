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

  constructor(
    private khoService: KhoService, 
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.tailaiDuLieu();
  }

  // Chuyển tiếng Việt có dấu thành không dấu để PDF không bị lỗi
  removeVietnameseTones(str: string): string {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Loại bỏ các ký tự đặc biệt gây lỗi nếu có
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  tailaiDuLieu() {
    this.khoService.getProducts().subscribe((data: any) => {
      this.dsSanPham = data;
      this.cdr.detectChanges(); 
    });
  }

  luuDuLieu(sp: any) {
    this.khoService.updateProduct(sp).subscribe(() => {
      alert('Đã cập nhật: ' + sp.name);
      this.cdr.detectChanges();
    });
  }

  exportToPDF() {
    const doc = new jsPDF();
    const now = new Date();
    const timeString = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN');

    doc.setFontSize(18);
    // Xuất tiêu đề không dấu để an toàn tuyệt đối
    doc.text('BAO CAO KIEM KHO MINI', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Ngay xuat: ${timeString}`, 14, 30);
    doc.text('Don vi: CTY TNHH DONG QUAN PHU', 14, 36);

    const dataForTable = this.dsSanPham.map(sp => [
      this.removeVietnameseTones(sp.name), // Xử lý xóa dấu ở đây
      sp.tonDau || 0,
      sp.nhapHang || 0,
      sp.kiemHang || 0,
      sp.kiemHang ? 'Da kiem' : 'Chua kiem'
    ]);

    autoTable(doc, {
      head: [['Ten San Pham', 'Ton Dau', 'Nhap', 'Kiem', 'Ghi chu']],
      body: dataForTable,
      startY: 45,
      theme: 'grid',
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: [255, 255, 255],
        halign: 'center'
      },
      styles: { fontSize: 9 }
    });

    doc.save(`Bao_Cao_Kho_${now.getDate()}_${now.getMonth() + 1}.pdf`);
  }
}