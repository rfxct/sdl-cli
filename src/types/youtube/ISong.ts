export default interface ISong {
  youtubeId: string
  title: string
  artist: string
  album: string
  thumbnailUrl: string
  duration: { label: string, totalSeconds: number }
  isExplicit: boolean
}
