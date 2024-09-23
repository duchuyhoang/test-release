import Oidc from "../index";
import { OidcClient } from "../package/client";

describe("VpToken", () => {
  let client: OidcClient;

  beforeEach(async () => {
    client = Oidc.createClient({
      authority: process.env.AUTHORITY_URL!,
      client_id: "n43P5EYdEeRvlwJOzX23J",
      client_secret:
        "RL-pcYiH0ihZlv3qOZhSnXnlf_lzoo_xv6I_ALqL2fRY_qfBfktN3vGMeCpmMQWBaFwqiqFNaV303WGzY9NNNA",
      configurationName: "default",
      redirect_uri: "",
      scope: "openid",
    }) as any;
  });
  test("Get exist VP Tokens", async () => {
    const response = await client.getVpTokens({
      ensName: "long.eth",
      federatedToken:
        "2de83125f2a0edfc5eeb8c45166fde2a36fb7ab55e17b72203c93c4de41da460",
    });
    console.log("response sa ", response);
    expect(response).not.toBe(undefined);
    expect(response).not.toBe(null);
    // (expect(response) as any).toBeNonEmptyArray(response);
  });

  test("Get non exist ENS name", async () => {
    const response = await client.getVpTokens({
      ensName: "cafafafafafa.eth",
      federatedToken:
        "2de83125f2a0edfc5eeb8c45166fde2a36fb7ab55e17b72203c93c4de41da460",
    });
    expect(response).toBe(null);
  });

  test("Get non exist federated token", async () => {
    const response = await client.getVpTokens({
      ensName: "long.eth",
      federatedToken: "xxxxx",
    });
    expect(response).toBe(null);
  });
});
