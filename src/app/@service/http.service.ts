import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // 動態取得當前主機名稱，確保在不同電腦測試時 API 指向正確位置
  public readonly BASE_URL = `${window.location.protocol}//${window.location.hostname}:8080`;

  constructor(private http: HttpClient) { }

  // 讀取
  getApi(
    url: string,
    options?: { params?: HttpParams | Record<string, any>; withCredentials?: boolean }
  ): any {
    return this.http.get(url, {
      withCredentials: options?.withCredentials ?? true,
      params: options?.params
    });
  }

  // 新增
  postApi<T>(url: string, postData: any) {
    return this.http.post<T>(url, postData, { withCredentials: true });
  }


  // 更新
  putApi(url: string, putDate: any) {
    return this.http.put(url, putDate);
  }

  // PATCH
  patchApi(url: string, body: any) {
    return this.http.patch(url, body, { withCredentials: true });
  }

  // 刪除
  delApi(url: string) {
    return this.http.delete(url);
  }

  // 拿行政區域
  getDApi(url: string, withCreds = true) {
    return this.http.get(url, {
      withCredentials: withCreds
    });
  }
}
