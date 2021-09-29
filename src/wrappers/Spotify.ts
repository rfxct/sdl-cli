import axios from 'axios'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import IAuthResult from '../interfaces/IAuthResult'
import IRefreshResult from '../interfaces/IRefreshResult'

const TOKEN = Buffer.from([process.env.CLIENT_ID, process.env.CLIENT_SECRET].join(':')).toString('base64')

export default class Spotify {
  // static async retrieveLikedSongs(access_token: string) {
  //   if (Date.now() - Number(config.get('generated')) > 3600 * 1000) {
  //     console.log(await Spotify.refreshUserToken(config.get('refresh_token')))
  //   }
  //   const BASE_URL = 'https://api.spotify.com/v1/me/tracks'
  //   const allTracks = []

  //   const { data } = await axios.get(BASE_URL,
  //     { headers: { 'Authorization': `Bearer ${access_token}` } }).catch(() => {
  //       return console.log('You need authorize again your spotify account.')
  //     })

  //   for (let i = 0; i <= Math.floor(data.total / 50); i++) {
  //     const { data } = await axios.get(BASE_URL + `?offset=${i * 50}&limit=50`,
  //       { headers: { 'Authorization': `Bearer ${access_token}` } })

  //     allTracks.push(...data.items)
  //   }
  //   return allTracks
  // }

  public static async refreshToken(refresh_token: string): Promise<IRefreshResult> {
    const result = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token }), {
      headers: { 'Authorization': `Basic ${TOKEN}`, 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    return result?.data || {}
  }

  public static async getToken(): Promise<IAuthResult> {
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
