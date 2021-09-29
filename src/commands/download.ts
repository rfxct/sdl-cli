import { Command } from '@oclif/command'

import Spotify from '../wrappers/Spotify'
import Cache from '../wrappers/Cache'

const PLAYLIST_PATTERN = /https?:\/\/open\.spotify\.com\/playlist\/(\w+)/i

export default class Download extends Command {
  static description = 'Baixa músicas de qualquer playlist'

  static args = [{
    name: 'playlist_url',
    required: true,
    description: 'Link da playlist à ser baixada',
  }]

  async run() {
    const { args } = this.parse(Download)
    if (!PLAYLIST_PATTERN.test(args.playlist_url)) return console.log('Forneça um URL no formato `https://open.spotify.com/playlist/xxxxxxxxxxxx`')

    const [, playlist_id] = PLAYLIST_PATTERN.exec(args.playlist_url) as any

    let access_token: string = Cache.get('access_token')
    const expired = Cache.get('generated_at') + (Cache.get('expires_in') * 1000)

    if (expired) {
      const refreshToken = Cache.get('refresh_token')
      if (!refreshToken) return console.log('Utilize o comando `login` para continuar.')

      console.log('Gerando novo token de acesso...')

      const result = await Spotify.refreshUserToken(refreshToken)
      Cache.persistAuth(result)

      access_token = result.access_token
    }

    const songs: any = await Spotify.getPlaylistSongs(access_token, playlist_id) as any
    console.log(songs)
  }
}
