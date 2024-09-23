import { OidcClientConfiguration } from "./@types";
import { OidcClient } from "./package/client";
export * from "./@types/response";
export * from "./common/constant";

const oidcDatabase: Record<string, OidcClient> = {};

export default class Oidc {
  static createClient(configuration: OidcClientConfiguration): OidcClient {
    const client = new OidcClient(configuration);

    oidcDatabase[configuration.configurationName] = client;

    return client;
  }

  static getClient(name: string) {
    return oidcDatabase[name] || null;
  }
}
