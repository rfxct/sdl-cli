import nconf from 'nconf'
nconf.file({ file: 'cache/auth.json' })

import IAuthResult from '../types/IAuthResult'
import IRefreshResult from '../types/IRefreshResult'

export default class Cache {
  static persistAuth(data: IAuthResult | IRefreshResult) {
    Object.entries({ generated_at: Date.now(), ...data }).forEach(values => nconf.set(...values))
    nconf.save({})
  }

  static tokenExpired() {
    return Cache.get('generated_at') + (Cache.get('expires_in') * 1000) < Date.now()
  }

  static get(key: string) {
    return nconf.get(key)
  }

  static set(key: string, value: any) {
    return nconf.set(key, value)
  }
}
