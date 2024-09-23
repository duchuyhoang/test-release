import {
  OidcConfiguration,
  OidcClientConfiguration,
  TokenResponse,
  OIDCResponseError,
} from "../@types";
import {
  getParseQueryStringFromLocation,
  makeRequest,
  OIDC_EVENTS,
} from "../common";
import { OidcClient } from "./client";
import { OidcStorage } from "./storage";

export interface LoginParams {
  options: OidcClientConfiguration;
  publishEvent: (evName: string, data: any) => void;
  client: OidcClient;
  storage: OidcStorage | null;
  anotherExtras?: Record<string, string>;
}

export const login = async ({
  options,
  publishEvent,
  client,
  storage,
  anotherExtras,
}: LoginParams) => {
  const OPTIONS_KEY: Array<keyof OidcClientConfiguration> = [
    "client_id",
    "client_secret",
    "redirect_uri",
    "scope",
  ];

  const params = [
    ...OPTIONS_KEY.map((key) => ({
      key,
      value: encodeURIComponent(options[key] as string),
    })),
    {
      key: "response_type",
      value: "code",
    },
    ...Object.entries(options.extras || {}).map(([key, value]) => ({
      key,
      value: encodeURIComponent(value),
    })),
    ...Object.entries(anotherExtras || {}).map(([key, value]) => ({
      key,
      value: encodeURIComponent(value),
    })),
  ];

  publishEvent(OIDC_EVENTS.LOGIN_BEGIN, {
    client,
    params,
  });

  if (options.extras?.state && storage) {
    storage.setStateAsync(options.extras?.state);
  }

  // const iframeEle = document.createElement("iframe");
  const loginUrl =
    client.serverConfiguration.authorization_endpoint +
    `?${params.map(({ key, value }) => `${key}=${value}`).join("&")}`;

  const idx = loginUrl.indexOf("/", loginUrl.indexOf("//") + 2);
  // const iFrameOrigin = loginUrl.substring(0, idx);

  const loginWindow = window.open(loginUrl, "_self");

  // loginWindow?.addEventListener("message", (e) => {
  //   console.log("e", e);
  // });

  // window.addEventListener("message", (event) => {
  //   console.log(event);
  //   if (event.origin !== window.location.origin) return; // Security check

  //   const { code } = event.data; // Extract the authorization code from the message
  //   if (code) {
  //     // Handle the authorization code (e.g., exchange it for tokens)
  //     console.log("Authorization code:", code);
  //     // You can now use the code to exchange for an access token
  //   }
  // });

  // iframeEle.setAttribute("src", loginUrl);
  // iframeEle.setAttribute("target", "_blank");

  // const listener = (e: MessageEvent) => {
  //   console.log(e, iframeEle, e.data);
  //   console.log(
  //     "receive",
  //     e.origin,
  //     e.source,
  //     // iframeEle.contentWindow,
  //     iframeEle.contentWindow?.location
  //   );

  //   if (e.origin === iFrameOrigin && e.source === iframeEle.contentWindow) {
  //     console.log("recea,ad");
  //   }
  // };

  // iframeEle.width = "0px";
  // iframeEle.height = `0px`;

  // const clear = () => {
  //   window.removeEventListener("message", listener);
  //   iframeEle.remove();
  // };

  // document.body.appendChild(iframeEle);
  // iframeEle.contentWindow!.document.open();
};

export const silentLogin = async () => {};

export const getToken = async ({
  oidc,
  publishEvent,
  code,
  storage,
}: {
  code?: string;
  oidc: OidcClient;
  publishEvent: (evName: string, data: any) => void;
  storage: OidcStorage | null;
}) => {
  let params: Record<string, any> = {};

  if (code) {
    params.code = code;
  } else {
    params = getParseQueryStringFromLocation(window.location.href);

    if (params.error || params.error_description) {
      publishEvent(OIDC_EVENTS.GET_TOKEN_FAILED, {
        client: oidc,
        error: {
          error: params.error,
          description: params.error_description,
        },
      });
      throw new Error(
        `Error from OIDC server: ${params.error} - ${params.error_description}`
      );
    }

    if (params.iss && params.iss !== oidc.serverConfiguration.issuer) {
      publishEvent(OIDC_EVENTS.GET_TOKEN_FAILED, {
        client: oidc,
        error: {
          error: oidc.serverConfiguration.issuer,
          description: `Issuer not valid (expected: ${oidc.serverConfiguration.issuer}, received: ${params.iss})`,
        },
      });

      throw new Error(
        `Issuer not valid (expected: ${oidc.serverConfiguration.issuer}, received: ${params.iss})`
      );
    }
    const state = storage ? storage.getStateAsync() : "";
    if (params.state && params.state !== state) {
      publishEvent(OIDC_EVENTS.GET_TOKEN_FAILED, {
        client: oidc,
        error: {
          error: "State not valid",
          description: `State not valid (expected: ${state}, received: ${params.state})`,
        },
      });

      throw new Error(
        `State not valid (expected: ${state}, received: ${params.state})`
      );
    }
  }

  publishEvent(OIDC_EVENTS.GET_TOKEN_BEGIN, {
    client: oidc,
    params,
  });

  const body = {
    grant_type: "authorization_code",
    code: params.code!,
    redirect_uri: oidc.configuration.redirect_uri,
    client_id: oidc.configuration.client_id,
    client_secret: oidc.configuration.client_secret,
    ...(oidc.configuration.extras || {}),
  };

  const [response, err] = await makeRequest<TokenResponse, OIDCResponseError>({
    url: oidc.serverConfiguration.token_endpoint,
    method: "POST",
    configs: {
      data: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        // ...headersExtras,
      },
    },
  });

  if (err || !response) {
    publishEvent(OIDC_EVENTS.GET_TOKEN_FAILED, {
      client: oidc,
      error: {
        error: err?.response?.data?.error || "Unknown error",
        description: err?.response?.data?.error_description || "Unknown error",
      },
    });
    throw new Error(err!.response?.data?.error || "Unknown error");
  }

  publishEvent(OIDC_EVENTS.GET_TOKEN_SUCCEED, {
    client: oidc,
    reponse: response.data,
  });

  return response.data;
};
