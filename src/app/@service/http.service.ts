import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  // 判斷是否為本地開發環境
  private get isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  // 判斷當前是否透過 Tailscale 域名存取
  private get isTailscale(): boolean {
    return window.location.hostname.endsWith('.ts.net');
  }

  // 自動切換 API 地址 (優先權：Local > Tailscale > Render)
  public get BASE_URL(): string {
    if (this.isLocalhost) {
      return `http://localhost:8080`; // 本地開發：指向本地 Spring Boot
    }

    if (this.isTailscale) {
      return `https://${window.location.hostname}:8443`; // Tailscale 遠端測試：強制 HTTPS + 8443
    }

    return `https://gogobuy.onrender.com`; // 正式環境：指向 Render 後端
  }

  constructor(private http: HttpClient) {
  }

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
