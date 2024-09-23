import {
  ExportEventFunc,
  OidcClientConfiguration,
  OidcServerConfiguration,
} from '../@types'
import { getRandomInt, makeRequest } from '../common'
import { VpToken } from '../@types/response'
import { getToken, login } from './login'
import { logout } from './logout'
import getUserInfo from './user-info'
import { OidcStorage } from './storage'

export class OidcClient {
  public serverConfiguration: OidcServerConfiguration
  private initAsyncPromise: Promise<any> = new Promise((rs, rj) => {})
  private events: Array<{
    eventName: string
    id: string
    func: ExportEventFunc
  }> = []

  private storage: OidcStorage | null

  constructor(public configuration: OidcClientConfiguration) {
    this.initAsync()
    this.getVpTokens = this.getVpTokens.bind(this)
    this.login = this.login.bind(this)
    this.getToken = this.getToken.bind(this)
    this.subscribeEvent = this.subscribeEvent.bind(this)
    this.publishEvent = this.publishEvent.bind(this)
    this.removeEventSubscription = this.removeEventSubscription.bind(this)
    this.logout = this.logout.bind(this)
    this.userInfo = this.userInfo.bind(this)
    this.verifyVpToken = this.verifyVpToken.bind(this)
  }

  private async initAsync() {
    this.initAsyncPromise = makeRequest<OidcServerConfiguration, any>({
      url: this.configuration.authority + `/.well-known/openid-configuration`,
    }).then(([response, err]) => {
      if (err) {
        throw new Error("Can't obtain OIDC server's configuration")
      }
      this.serverConfiguration = response!.data as OidcServerConfiguration

      if (this.configuration.configurationName)
        this.storage = new OidcStorage({
          configurationName: this.configuration.configurationName,
        })
    })
  }

  async getVpTokens(params: { ensName: string; federatedToken: string }) {
    const [res, err] = await makeRequest<{ vp_token: VpToken[] }, any>({
      url: this.configuration.authority + '/oidc/vp-token',
      configs: {
        params: {
          ens_name: params.ensName,
          federated_token: params.federatedToken,
        },
      },
    })
    if (err) return null
    return res?.data.vp_token
  }

  public async subscribeEvent(eventName: string, func: ExportEventFunc) {
    const id = getRandomInt(9999999999).toString()
    this.events.push({
      id: id,
      eventName: eventName,
      func,
    })
    return id
  }

  private publishEvent(evName: string, data: any) {
    this.events.forEach(({ func, eventName }) => {
      if (eventName === evName) {
        func(eventName, data)
      }
    })
  }

  public removeEventSubscription(id: string): void {
    const newEvents = this.events.filter(
      (e) => e.id !== id && e.eventName !== id,
    )
    this.events = newEvents
  }

  public async login(options?: { extras?: Record<string, string> }) {
    await this.initAsyncPromise

    return login({
      publishEvent: this.publishEvent,
      options: this.configuration,
      client: this,
      storage: this.storage,
      anotherExtras: options?.extras || {},
    })
  }

  public async getToken(code?: string) {
    await this.initAsyncPromise
    return getToken({
      oidc: this,
      publishEvent: this.publishEvent,
      code: code,
      storage: this.storage,
    })
  }

  public async logout({ token }: { token: string }) {
    return logout({
      oidc: this,
      publishEvent: this.publishEvent,
      token,
    })
  }

  public async userInfo({ token }: { token: string }) {
    return getUserInfo({
      oidc: this,
      publishEvent: this.publishEvent,
      token,
    })
  }

  public verifyVpToken({}: { issuer: string; token: VpToken }) {}
}
