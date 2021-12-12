import IImage from './IImage'
import IArtist from './IArtist'

export default interface IAlbum {
  album_type: string
  artists: IArtist[]
  href: string
  id: string
  images: IImage[]
  name: string
  release_date: string
  release_date_precision: string
  total_tracks: number
  type: string
  uri: string
}
