import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { Song, songWithInfo } from './models/songs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  songs: songWithInfo[];
  pages:Array<any>;

  constructor(private apiService:ApiService){}  

  ngOnInit(){
    this.apiService.getInitData()
    .subscribe((songsResp:{songs:songWithInfo[],links:Array<any>})=> {
      this.songs = songsResp.songs;
      this.pages = songsResp.links;
    })
  }

  paginationClick(url){
    this.apiService.getSongs(url)
    .subscribe((songsResp:{songs:songWithInfo[],links:Array<any>})=> {
      this.songs = songsResp.songs;
      this.pages = songsResp.links;
    })
  }
}
