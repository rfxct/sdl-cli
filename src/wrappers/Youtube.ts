import * as ym from 'node-youtube-music'

export default class Youtube {
  public static async retriveSongURL(songName: string) {
    const [result] = await ym.searchMusics(songName)
    console.log(result)
  }
}
