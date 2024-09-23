import { OIDCResponseError, OidcClientConfiguration } from "../@types";
import { OIDC_EVENTS, makeRequest } from "../common";
import { OidcClient } from "./client";

export const logout = async ({
  oidc,
  publishEvent,
  token,
}: {
  token: string;
  oidc: OidcClient;
  publishEvent: (evName: string, data: any) => void;
}) => {
  const revocationUrl = oidc.serverConfiguration.revocation_endpoint;

  const options = oidc.configuration;

  if (!revocationUrl) {
    publishEvent(OIDC_EVENTS.LOGOUT_FAILED, {
      client: oidc,
      error: {
        error: `OIDC Server doesn't support revocation`,
        description: `OIDC Server doesn't support revocation`,
      },
    });
    throw new Error(`OIDC Server doesn't support revocation`);
  }

  const body = {
    client_id: options.client_id,
    client_secret: options.client_secret,
    token_type_hint: "access_token",
    token,
  };

  const [response, err] = await makeRequest<any, OIDCResponseError>({
    url: revocationUrl,
    method: "POST",
    configs: {
      data: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  });

  if (err) {
    publishEvent(OIDC_EVENTS.LOGOUT_FAILED, {
      client: oidc,
      error: {
        error: err?.response?.data?.error || "Unknown error",
        description: err?.response?.data?.error_description || "Unknown error",
      },
    });
    throw new Error(err!.response?.data?.error || "Unknown error");
  }

  publishEvent(OIDC_EVENTS.LOGOUT_SUCCEED, {
    client: oidc,
    reponse: response?.data || null,
  });

  return response?.data || null;
};
