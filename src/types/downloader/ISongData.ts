import { MusicVideo } from 'node-youtube-music'

export default interface ISongData {
  song: MusicVideo
  output: string
}

export type QueueTask = {
  song: MusicVideo
  output: string
}
