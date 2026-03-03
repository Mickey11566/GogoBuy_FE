import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum NotifiCategoryEnum {
  GROUP_BUY = 'GROUP_BUY',
  SYSTEM = 'SYSTEM',
  WISH = 'WISH'
}

export interface NotifiMesReq {
  id?: number;
  category: NotifiCategoryEnum;
  title: string;
  content: string;
  targetUrl?: string; // Optional
  expiredAt?: string; // String format for backend
  createdAt?: string;
  userId?: string;
  eventId?: number;
  userNotificationVoList?: any[];
}

import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private http: HttpClient,
    private https: HttpService
  ) { }

  create(req: NotifiMesReq): Observable<any> {
    return this.http.post(`${this.https.BASE_URL}/gogobuy/messages/create`, req);
  }

  // 管理者發送 SSE 公告
  setGlobalNotice(req: { content: string, expiredAt?: string }): Observable<any> {
    const url = `${this.https.BASE_URL}/api/sse/set-notice`;
    return this.http.post(url, req, { responseType: 'text' });
  }

  // 取得公告列表
  getGlobalNoticeHistory(): Observable<any> {
    const url = `${this.https.BASE_URL}/api/sse/history`;
    return this.http.get(url);
  }
}
