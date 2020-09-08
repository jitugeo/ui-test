export interface Song{
    album_id: number;
    track: number;
    id: number;
    name: string;
}

export interface songWithInfo extends Song{
    album_name:string;
    year_released:number;
    artist_name:string;
}