import ytdl from 'ytdl-core'

import path from 'path'
import fs from 'fs'

import fastq, { queueAsPromised } from 'fastq'
import chalk from 'chalk'
import cli from 'cli-ux'
import sanitize = require('sanitize-filename')

import IDownloaderConfig from '../types/downloader/IDownloaderConfig'
import ISongData, { QueueTask } from '../types/downloader/ISongData'
import IDownloaderSong from '../types/downloader/IDownloaderSong'

const formatBytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(2)

export default class Downloader {
  public config
  public source

  public folder
  public output
  public threads

  constructor(source: string, config?: IDownloaderConfig) {
    this.config = config
    this.source = source

    this.folder = sanitize(config?.folder ?? '')
    this.output = path.resolve('songs', this.source, this.folder)
    this.threads = config?.threads ?? 50
  }

  async start(songs: IDownloaderSong[]) {
    const startedAt = Date.now()
    console.log(`[${chalk.green(this.source.toUpperCase())}] Baixando ${songs.length} músicas de ${chalk.inverse(this.folder)}`)

    const queue: queueAsPromised<QueueTask> = fastq.promise(this.downloadSong, this.threads)
    queue.empty = () => cli.action.stop(
      `Todas as músicas foram baixadas em ${~~((Date.now() - startedAt) / 1000)} segundos`
    )

    await fs.promises.mkdir(this.output, { recursive: true })

    songs.forEach(async ({ youtube: song }) => {
      const output = path.join(
        this.output,
        sanitize(`${song.artist} - ${song.title}.mp3`).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )

      queue.push({ song, output })
        .then(() => cli.info(`${song.artist} - ${song.title} [${queue.getQueue().length}]`))
        .catch(() => {
          cli.error(`Erro ao baixar a música ${chalk.inverse(`${song.artist} - ${song.title}`)}`, { exit: false })
          queue.push({ song, output })
        })
    })
  }

  public async downloadSong({ song, output }: ISongData) {
    const songName = [song.artist, song.title].join(' - ')

    return new Promise((resolve, reject) => {
      ytdl(song.youtubeId as string, { quality: 'highestaudio', filter: 'audioonly' })
        .on('error', reject)
        .on('end', resolve)
        .on('response', () => cli.action.start(`Baixando ${chalk.inverse(songName)}`))
        .on('progress', (_, p, t) => (
          cli.action.status = `[${formatBytes(p)}MB/${formatBytes(t)}MB]`
        ))
        .pipe(fs.createWriteStream(output))
    })
  }
}
