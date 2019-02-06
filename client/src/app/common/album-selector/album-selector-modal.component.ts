import { Component, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import Album = Definitions.Album;

const fadeInAnimation = trigger('fadeInAnimation', [
  transition(':enter', group([
    query('.modal', [
      style({ opacity: 0.7, transform: 'translate3d(30%, 0, 0)' }),
      animate('.7s 10ms cubic-bezier(.3,.98,.11,1.0)', style({ opacity: 1, transform: 'translate3d(0, 0, 0)'}))
    ]),
    query('.overlay', [
      style({ opacity: 0 }),
      animate('.7s 10ms cubic-bezier(.3,.98,.11,1.0)', style({ opacity: 0.6 }))
    ])
  ])),
  transition(':leave', group([
    query('.modal', [
      style({ opacity: 0.7, transform: 'translate3d(0, 0, 0)' }),
      animate('.7s 10ms cubic-bezier(.3,.98,.11,1.0)', style({ opacity: 0, transform: 'translate3d(10%, 0, 0)'}))
    ]),
    query('.overlay', [
      style({ opacity: 0.6 }),
      animate('.7s 10ms cubic-bezier(.3,.98,.11,1.0)', style({ opacity: 0 }))
    ])
  ]))
]);

@Component({
  selector: 'app-album-selector-modal',
  templateUrl: './album-selector-modal.component.html',
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' }
})
export class AlbumSelectorModalComponent {

  @HostBinding('class.opened')
  opened: boolean;

  albums: Album[] = [];
  allAlbums: Album[] = [];

  query: string;

  constructor(private router: Router, private route: ActivatedRoute) {
    route.data.subscribe(data => {
      this.allAlbums = data.albums;
      this.albums = data.albums;
    });
  }

  searchAlbums(event): void {
    this.albums = this.allAlbums
      .filter(album =>
          album.name.toLocaleLowerCase().indexOf(event.toLocaleLowerCase()) !== -1 ||
        album.tree.findIndex(group => group.toLocaleLowerCase().indexOf(event.toLocaleLowerCase()) !== -1) > -1
      );
  }

  close(): void {
    this.router.navigate([{outlets: {modal: null}}]);
  }
}
