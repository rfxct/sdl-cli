import IImage from '../IImage'
import IPlaylistTrack from './IPlaylistTrack'

export default interface IPlaylist {
  collaborative: boolean
  href: string
  id: string
  images: IImage[]
  name: string
  public: boolean
  tracks: {
    href: string
    items: IPlaylistTrack[]
    limit: number
    next: number | null
    offset: number
    previous: number | null
    total: number
  }
  type: string
  uri: string
}
