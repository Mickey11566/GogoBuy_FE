import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/*
 * 後端允許的上傳類型 private final List<String> ALLOWED_TYPES = List.of("avatars", "stores", "menu");
 * "avatars", "stores", "menu"
 */
export type ImageType = 'avatars' | 'stores' | 'menu';

import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(
    private http: HttpClient,
    private https: HttpService
  ) { }

  upload(type: ImageType, file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);

    return this.http.post(`${this.https.BASE_URL}/image/upload/${type}`, form, {
      responseType: 'text',
    });
  }
}
