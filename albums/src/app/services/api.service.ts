import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Artist } from '../models/artists';
import { Album } from '../models/albums';
import { Song, songWithInfo } from '../models/songs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  private artistsUrl = 'http://localhost:5000/artists';
  private albumsUrl = 'http://localhost:5000/albums';
  private songsUrl = 'http://localhost:5000/songs';
  private defaultPage = 1;
  private defaultLimit=10;

  private artistsObj={};
  private albumsObj={};

  private headers = new HttpHeaders({
      Authorization: `Bearer${this.token}`
    });
  
  constructor(private http:HttpClient) { }

  private getArtists():Observable<Artist[]>{
    return this.http.get<Artist[]>(this.artistsUrl,{headers:this.headers})
            .pipe(
              map((artists)=>{
                this.artistsObj = artists.reduce((acc,val)=>{
                  acc[val.id] = {...val};
                  return acc;
                },{});
                return artists;
              })
            )
  }

  private getAlbums():Observable<Album[]>{
    return this.http.get<Album[]>(this.albumsUrl,{headers:this.headers})
    .pipe(
      map((albums)=>{
        this.albumsObj = albums.reduce((acc,val)=>{
          acc[val.id] = {...val};
          return acc;
        },{});
        return albums;
      })
    )
  }

  private mapSongsWithInfo(songs:Song[]):songWithInfo[]{
    const updatedSongs = songs.reduce((acc,val) => {
      const album = {...this.albumsObj[val.album_id]};
      const artist = {...this.artistsObj[album.artist_id]};
      acc.push({...val,album_name:album.name,year_released:album.year_released,artist_name:artist.name});
      return acc;
    },[]) ;

    return updatedSongs;
  }

  private splitLinks(linksStr:string){
    const links = linksStr.split(',');
    const linksObj = links.reduce((acc,val)=>{
      const [link,rel] = val.split(';');
      acc.push({link:link.replace(/[<>]/g, ''),rel:rel.split('=')[1].replace(/["]/g, '')});
      return acc;
    },[]);
    return linksObj
  }

  public getSongs(url:string):Observable<{songs:songWithInfo[],links:Array<any>}>{
    return this.http.get<Song[]>(url,{ observe: 'response',headers:this.headers })
    .pipe(
      map((response:any)=>{
        const songs = this.mapSongsWithInfo(response.body);
        let links = response.headers.get('Link');

        if(links && links !==''){
          links = this.splitLinks(links);
        }else{
          links = [];
        }
        return {songs, links}
      })
    )
  }

  public getInitData(page=this.defaultPage,limit=this.defaultLimit):Observable<{songs:songWithInfo[],links:Array<any>}>{
    return forkJoin(
      this.getArtists(),
      this.getAlbums(),
      this.getSongs(`${this.songsUrl}?_limit=${limit}&_page=${page}`)
    )
    .pipe(
      map(([artists, albums, songs])=>{
        return songs;
      })
    )
  }
}
