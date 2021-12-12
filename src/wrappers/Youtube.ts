import { searchMusics } from 'node-youtube-music'

export default class Youtube {
  public static async retriveSongURL(songName: string) {
    const [result] = await searchMusics(songName)
    return result
  }
}
