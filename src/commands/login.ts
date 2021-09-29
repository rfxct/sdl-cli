import { Command } from '@oclif/command'
import cli from 'cli-ux'

import Spotify from '../wrappers/Spotify'
import Cache from '../wrappers/Cache'

import * as nconf from 'nconf'
nconf.file({ file: 'cache/auth.json' })

export default class Login extends Command {
  static description = 'Conecta à sua conta do Spotify utilizando o OAuth2'

  async run() {
    await cli.open([
      'https://accounts.spotify.com/authorize?',
      new URLSearchParams({
        response_type: 'code',
        client_id: (process.env.CLIENT_ID as string),
        scope: (process.env.SCOPES as string).split(',').join(' '),
        redirect_uri: (process.env.REDIRECT_URI as string)
      })
    ].join(''))

    const result = await Spotify.getUserToken()
    Cache.persistAuth(result)

    console.log('Autenticado com sucesso')
  }
}
