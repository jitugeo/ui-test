import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from './services/api.service';
import { Song, songWithInfo } from './models/songs';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

const ASC = 'asc';
const DESC = 'desc';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	pages: Array<any>;
	faSort = faSort;
	faSortUp = faSortUp;
	faSortDown = faSortDown;
	asc = ASC;
	sortCol = 1;
	sortColName = 'artist_name';
	sortOrder = ASC;
	columns = [
		{ id: 1, name: 'Artist Name', sortColName: 'artist_name' },
		{ id: 2, name: 'Album Name', sortColName: 'album_name' },
		{ id: 3, name: 'Year Released', sortColName: 'year_released' },
		{ id: 4, name: 'Song Track#', sortColName: 'track' },
		{ id: 5, name: 'Song Name', sortColName: 'name' },
	]

	private _songs: songWithInfo[];
	private dataUnsubscribe$: Subject<void> = new Subject();

	get songs(): songWithInfo[] {
		return this._songs;
	}
	set songs(val: songWithInfo[]) {
		this.sortSongs(val, this.sortColName, this.sortOrder);
		this._songs = val;
	}

	sortSongs(songs: songWithInfo[], sortColName: string, sortOrder: string) {
		songs.sort((a, b) => {
			if (a[sortColName] > b[sortColName]) {
				return (sortOrder == ASC) ? 1 : -1;
			} else if (a[sortColName] < b[sortColName]) {
				return (sortOrder == ASC) ? -1 : 1;
			}
			else {
				return 0;
			}
		})
	}

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
			})
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
			})
	}

	colSort(col) {
		if (col.id == this.sortCol) {
			this.sortOrder = (this.sortOrder == ASC) ? DESC : ASC;
		} else {
			this.sortOrder = ASC;
		}
		this.sortCol = col.id;
		this.sortColName = col.sortColName;
		this.sortSongs(this.songs, this.sortColName, this.sortOrder);
	}

	ngOnDestroy(): void {
		this.dataUnsubscribe$.next();
		this.dataUnsubscribe$.complete();
	}

}
