import { Command } from '@oclif/command'
import Spotify from '../apis/Spotify'

import * as nconf from 'nconf'

nconf.file({ file: 'cache/auth.json' })

export default class Login extends Command {
  static description = 'Conecta à sua conta do Spotify utilizando o OAuth2'

  async run() {
    const result = await Spotify.login()

    Object.entries({ generated_at: Date.now(), ...result }).forEach(values => nconf.set(...values))
    nconf.save({})
  }
}
