import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { PopularService } from '../@service/popular.service';
import { Router } from '@angular/router';

interface StatusOption {
  label: string;
  value: 'YEAR' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
}

interface SalesLeaderboardProjection {
  storeName: string;
  productName: string;
  salesVolume: number;
  menuId: number;
  productImage: string;
  storeId: number;
}
@Component({
  selector: 'app-popular',
  standalone: true,
  imports: [
    SelectModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './popular.component.html',
  styleUrl: './popular.component.scss'
})
export class PopularComponent {

  constructor(private popularService: PopularService, private router: Router) { }

  salesDetailList = signal<SalesLeaderboardProjection[]>([]);

  // 篩選條件
  statusFilter = signal<'YEAR' | 'MONTHLY' | 'WEEKLY' | 'DAILY'>('YEAR');

  // 排行榜資料
  top10List = signal<any[]>([]);

  topFive = computed(() => this.salesDetailList().slice(0, 5));

  statusOptions: StatusOption[] = [
    { label: '顯示 1 年', value: 'YEAR' },
    { label: '顯示 1 個月', value: 'MONTHLY' },
    { label: '顯示 1 個禮拜', value: 'WEEKLY' },
    { label: '顯示 1 天', value: 'DAILY' },
  ];

  ngOnInit() {
    this.loadTop10();
  }

  onStatusChange(value: 'YEAR' | 'MONTHLY' | 'WEEKLY' | 'DAILY') {
    this.statusFilter.set(value);
    this.loadTop10();
  }

  loadTop10() {
    const type = this.statusFilter();
    this.popularService.getTop10(type).subscribe({
      next: (res: any) => {
        this.salesDetailList.set(res.salesDetailList ?? []);
      },
      error: (err: any) => console.error(err),
    });
  }

  goStore(storeId: number) {
    this.router.navigate(['/management/store_info', storeId])
  }

}
