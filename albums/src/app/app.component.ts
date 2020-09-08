import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from './services/api.service';
import { Song, songWithInfo } from './models/songs';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	songs: songWithInfo[];
	pages: Array<any>;
	private dataUnsubscribe$: Subject<void> = new Subject();


	constructor(private apiService: ApiService) { }


	ngOnInit() {
		this.apiService.getInitData()
			.pipe(
				filter(data => data !== undefined),
				takeUntil(this.dataUnsubscribe$)
			)
			.subscribe((songsResp: { songs: songWithInfo[], links: Array<any> }) => {
				this.songs = songsResp.songs;
				this.pages = songsResp.links;
			});
	}

	paginationClick(url) {
		this.apiService.getSongs(url)
			.pipe(
				filter(data => data !== undefined),
				takeUntil(this.dataUnsubscribe$)
			)
			.subscribe((songsResp: { songs: songWithInfo[], links: Array<any> }) => {
				this.songs = songsResp.songs;
				this.pages = songsResp.links;
			});
	}

	ngOnDestroy(): void {
		this.dataUnsubscribe$.next();
		this.dataUnsubscribe$.complete();
	}

}
