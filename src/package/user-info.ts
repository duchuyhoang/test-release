import { OIDCResponseError } from "../@types";
import { OIDC_EVENTS, makeRequest } from "../common";
import { OidcClient } from "./client";

const getUserInfo = async ({
  token,
  publishEvent,
  oidc,
}: {
  token: string;
  publishEvent: (evName: string, data: any) => void;
  oidc: OidcClient;
}) => {
  publishEvent(OIDC_EVENTS.GET_USER_INFO_BEGIN, {
    client: oidc,
  });
  const getMeUrl = oidc.serverConfiguration.userinfo_endpoint;

  if (!getMeUrl) {
    publishEvent(OIDC_EVENTS.GET_USER_INFO_FAILED, {
      client: oidc,
      error: {
        error: `OIDC Server doesn't support user info request`,
        description: `OIDC Server doesn't support user info request`,
      },
    });
    throw new Error(`OIDC Server doesn't support user info request`);
  }

  const [response, err] = await makeRequest<any, OIDCResponseError>({
    url: getMeUrl,
    method: "GET",
    configs: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (err || !response) {
    publishEvent(OIDC_EVENTS.GET_USER_INFO_SUCCEED, {
      client: oidc,
      error: {
        error: err?.response?.data?.error || "Unknown error",
        description: err?.response?.data?.error_description || "Unknown error",
      },
    });
    throw new Error(err!.response?.data?.error || "Unknown error");
  }

  publishEvent(OIDC_EVENTS.GET_USER_INFO_FAILED, {
    client: oidc,
    data: response.data,
  });

  return response.data;
};

export default getUserInfo;
