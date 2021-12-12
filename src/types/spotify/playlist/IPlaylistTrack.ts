import ITrack from '../ITrack'

export default interface IPlaylistTrack {
  added_at: string
  added_by: {
    external_urls: {
      [url: string]: string
    }
    href: string
    id: string
    type: string
    uri: string
  }
  is_local: false
  primary_color: number | null
  track: ITrack
  video_thumbnail: { url: string | null }
}
