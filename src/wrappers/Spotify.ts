import axios from 'axios'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'

import IAuthResult from '../interfaces/IAuthResult'
import IRefreshResult from '../interfaces/IRefreshResult'

const TOKEN = Buffer.from([process.env.CLIENT_ID, process.env.CLIENT_SECRET].join(':')).toString('base64')

export default class Spotify {
  // static async retrieveLikedSongs(access_token: string) {
  //   const tracks = []
  //   const { data } = await axios.get('https://api.spotify.com/v1/me/tracks', {
  //     headers: { 'Authorization': `Bearer ${access_token}` }
  //   })

  //   for (let i = 0; i <= Math.floor(data.total / 50); i++) {
  //     const { data } = await axios.get(`https://api.spotify.com/v1/me/tracks?offset=${i * 50}&limit=50`,
  //       { headers: { 'Authorization': `Bearer ${access_token}` } })

  //     tracks.push(...data.items.map(track => track))
  //   }
  //   return tracks
  // }

  public static async getPlaylistSongs(access_token: string, playlist_id: string) {
    const result = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    })

    return result?.data || {}
  }

  public static async refreshUserToken(refresh_token: string): Promise<IRefreshResult> {
    const result = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token }), {
      headers: { 'Authorization': `Basic ${TOKEN}`, 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    return result?.data || {}
  }

  public static async getUserToken(): Promise<IAuthResult> {
    return new Promise((resolve, reject) => {
      const server = fastify()

      server.get('/auth', async (req: FastifyRequest, reply: FastifyReply) => {
        const { code } = req.query as { code: string }
        const { data } = await axios.post('https://accounts.spotify.com/api/token',
          new URLSearchParams({ grant_type: 'authorization_code', redirect_uri: (process.env.REDIRECT_URI as string), code }), {
          headers: { 'Authorization': `Basic ${TOKEN}`, 'Content-Type': 'application/x-www-form-urlencoded' }
        })

        const authenticated = !!data.access_token
        authenticated ? resolve(data) : reject(data)

        reply.send(authenticated ? 'Autenticado com sucesso' : 'Ocorreu um erro na autenticação')
        server.close()
      })

      server.listen(process.env.SERVER_PORT as string)
    })
  }
}
