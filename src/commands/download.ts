import { Command } from '@oclif/command'

import Spotify from '../wrappers/Spotify'
import Cache from '../wrappers/Cache'
import Youtube from '../wrappers/Youtube'
import Downloader from '../wrappers/Downloader'
import IDownloaderSong from '../types/downloader/IDownloaderSong'

const PLAYLIST_PATTERN = /https?:\/\/open\.spotify\.com\/playlist\/(\w+)/i

export default class Download extends Command {
  static description = 'Baixa músicas de qualquer playlist'

  static args = [{
    name: 'playlist_url',
    required: true,
    description: 'Link da playlist a ser baixada',
  }]

  async run() {
    const { args } = this.parse(Download)
    if (!PLAYLIST_PATTERN.test(args.playlist_url)) return console.log('Forneça um URL no formato `https://open.spotify.com/playlist/xxxxxxxxxxxx`')

    const [, playlist_id] = PLAYLIST_PATTERN.exec(args.playlist_url) as any

    let access_token: string = Cache.get('access_token')
    const expired = Cache.get('generated_at') + (Cache.get('expires_in') * 1000) < Date.now()

    if (expired || !access_token) {
      const refreshToken = Cache.get('refresh_token')
      if (!refreshToken) return console.log('Utilize o comando `login` para continuar.')
      console.log('Gerando novo token de acesso...')

      const result = await Spotify.refreshUserToken(refreshToken)
      Cache.persistAuth(result)

      access_token = result.access_token
    }

    const playlist = await Spotify.getPlaylist(access_token, playlist_id)

    const songs = await Promise.all<IDownloaderSong>(
      playlist!.tracks.items.map(({ track }) => new Promise(async (resolve, reject) => {
        const song = await Youtube.retriveSongURL(`${track.artists[0].name} - ${track.name}`)
        if (!song) return reject(undefined)
        resolve({ spotify: track, youtube: song })
      }))
    )

    const downloader = new Downloader('spotify', { folder: playlist?.name })
    await downloader.start(songs.filter(Boolean))
  }
}
