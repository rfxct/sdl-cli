import axios from 'axios'
import cli from 'cli-ux'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import IAuthResult from '../interfaces/IAuthResult'

const TOKEN = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')

export default class Spotify {
  static async login() {
    cli.action.start('Aguardando por autenticação')

    await cli.open([
      'https://accounts.spotify.com/authorize?',
      new URLSearchParams({
        response_type: 'code',
        client_id: (process.env.CLIENT_ID as string),
        scope: (process.env.SCOPES as string).split(',').join(' '),
        redirect_uri: (process.env.REDIRECT_URI as string)
      })
    ].join(''))

    const token = await Spotify.getToken()

    cli.action.stop('autenticado')
    return token
  }

  private static async getToken(): Promise<IAuthResult> {
    return new Promise((resolve, reject) => {
      const server = fastify()

      server.get('/auth', async (req: FastifyRequest, reply: FastifyReply) => {
        const { code } = req.query as { code: string }
        const data = await Spotify.retrieveUserToken(code)

        const authenticated = !!data.access_token

        if (authenticated) resolve(data)
        else reject(data)

        reply.send(authenticated ? 'Autenticado com sucesso' : 'Ocorreu um erro na autenticação')
        server.close()
      })

      server.listen(process.env.SERVER_PORT as string)
    })
  }

  private static async retrieveUserToken(code: string) {
    const result = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'authorization_code', redirect_uri: (process.env.REDIRECT_URI as string), code }), {
      headers: { 'Authorization': `Basic ${TOKEN}`, 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    return result?.data || {}
  }
}
