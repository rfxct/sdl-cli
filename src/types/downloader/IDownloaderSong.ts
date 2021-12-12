import ITrack from '../spotify/ITrack'
import { MusicVideo } from 'node-youtube-music'

export default interface IDownloaderSong {
  spotify: ITrack
  youtube: MusicVideo
}
