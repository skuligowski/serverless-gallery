import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { spinnable } from './common/utils/spinnable';
import { HttpClient } from '@angular/common/http';
import Album = Definitions.Album;
import Image = Definitions.Image;
import ImagesAddRequest = Definitions.ImagesAddRequest;
import ImagesRemovalRequest = Definitions.ImagesRemovalRequest;


@Injectable()
export class AlbumsService {

  private albums: Album[];
  private albumDetailsMap: {[albumId: string]: AlbumDetails} = {};

  private useCache = true;

  constructor(private httpClient: HttpClient) {}

  getAlbums(): Observable<Album[]> {
    return this.albums ? of(this.albums) : spinnable(
      this.httpClient.get<Album[]>('/api/albums')
    ).pipe(tap(albums => this.albums = albums));
  }

  getImages(albumId: string): Observable<Image[]> {
    return spinnable(
      this.httpClient.get<Image[]>(`/api/albums/${albumId}/images`)
    );
  }

  addImages(albumId: string, imagePaths: string[]) {
    return spinnable(
      this.httpClient.post<ImagesAddRequest>(`/api/albums/${albumId}/images`, imagePaths)
    ).pipe(this.refreshAlbums());
  }

  removeImages(albumId: string, imageUrls: string[]) {
    return spinnable(
      this.httpClient.post<ImagesRemovalRequest>(`/api/albums/${albumId}/images/removal`, imageUrls)
    ).pipe(this.refreshAlbums());
  }

  createAlbum(name: string, permalink: string, date: string): Observable<any> {
    return spinnable(
      this.httpClient.post<any>('/api/albums', { name, permalink, date })
    ).pipe(this.refreshAlbums());
  }

  patchAlbum(albumId: string, name: string, permalink: string, date: string): Observable<any> {
    return spinnable(
      this.httpClient.patch<any>(`/api/albums/${albumId}`, { name, permalink, date })
    ).pipe(this.refreshAlbums());
  }

  removeAlbum(albumId: string): Observable<any> {
    return spinnable(
      this.httpClient.delete<any>(`/api/albums/${albumId}`)
    ).pipe(this.refreshAlbums());
  }

  getAlbumDetailsById(albumId: string): Observable<AlbumDetails> {
    return this.findAlbumDetails(album => album.id === albumId);
  }

  getAlbumDetails(albumPermalink: string): Observable<AlbumDetails> {
    return this.findAlbumDetails(album => album.permalink === albumPermalink);
  }

  private findAlbumDetails(albumPredicate: (album) => boolean): Observable<AlbumDetails> {
    return this.getAlbums().pipe(switchMap(albums => {
      const album = albums.find(albumPredicate);
      if (!album) {
        return throwError(new Error('Album does not exist'));
      }
      const albumDetails = this.albumDetailsMap[album.id];
      if (albumDetails && this.useCache) {
        return of(albumDetails);
      } else {
        return this.getImages(album.id).pipe(
          map(images => ({
            ...album,
            images
          })),
          tap(albumDetails => this.albumDetailsMap[albumDetails.id] = albumDetails)
        );
      }
    }));
  }

  private refreshAlbums<T>(): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) => source.pipe(
      switchMap((value: T) => spinnable(this.httpClient.get<Album[]>('/api/albums')).pipe(
        tap(albums => {
          this.albums = albums;
          this.albumDetailsMap = {};
        }),
        switchMap(() => of(value))
      ))
    );
  }
}

export interface AlbumDetails extends Album {
  images: Image[];
}
