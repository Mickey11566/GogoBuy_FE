import { Component } from '@angular/core';
import { HttpService } from '../../@service/http.service';
import { AuthService } from '../../@service/auth.service';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wishes',
  imports: [CommonModule, TabsModule],
  templateUrl: './wishes.component.html',
  styleUrl: './wishes.component.scss',
})
export class WishesComponent {
  constructor(private http: HttpService, public auth: AuthService) {}
  // 實際裝願望清單
  // wishes: any[] = [];

  // 願望清單假資料
  wishes: any[] = [
    {
      id: 3,
      user_id: '5274e1a0-40cd-4e2b-9528-a3779e2f84a6',
      nickname: "小林",
      title: '五十嵐',
      followers: [
        '74db5f21-f331-4824-853b-0be13d633c80',
        '12b7bf42-57af-4e3f-acfc-b9a2ba3342aa',
      ],
      type: '飲料',
      buildDate: '2026-01-09',
      location: '資安大樓',
    },
    {
      id: 4,
      user_id: '12b7bf42-57af-4e3f-acfc-b9a2ba3342aa',
      nickname: null,
      title: '大祥燒臘',
      followers: [],
      type: '便當',
      buildDate: '2026-01-09',
      location: '資安大樓',
    },
  ];
}
