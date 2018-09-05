import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import LibraryFile = Definitions.LibraryFile;


@Injectable()
export class LibraryService {

  constructor(private httpClient: HttpClient) {}

  getFiles(parent: string): Observable<LibraryFile[]> {
    let params: HttpParams;
    if (parent) {
      params = new HttpParams().set('parent', parent);
    }
    return this.httpClient.get<LibraryFile[]>(`/api/library/files`, { params });
  }

  upload(files: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', files);

    const params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    const req = new HttpRequest('POST', '/api/upload', formData, options);
    return this.httpClient.request(req);
  }

}
