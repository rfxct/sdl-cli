import IAlbum from './IAlbum'
import IArtist from './IArtist'

export default interface ITrack {
  album: IAlbum
  artists: IArtist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  episode: boolean
  explicit: boolean
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string
  track: true
  track_number: number
  type: string
  uri: string
}
