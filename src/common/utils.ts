import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";

export const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const extractOrigin = (url: string) => {
  const idx = url.indexOf("/", url.indexOf("//") + 2);
  return url.substring(0, idx);
};

export const makeRequest = async <T, E>(payload: {
  url: string;
  method?: Method;
  configs?: Omit<AxiosRequestConfig<any>, "url" | "method">;
}): Promise<[AxiosResponse<T> | null, AxiosError<E> | null]> => {
  try {
    const response = await axios.request({
      url: payload.url,
      method: payload.method || "GET",
      ...payload.configs,
    });
    return [response, null];
  } catch (e) {
    return [null, e as AxiosError<E>];
  }
};

export const getLocation = (href: string) => {
  const match = href.match(
    // eslint-disable-next-line no-useless-escape
    /^([a-z][\w-]+\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
  );
  if (!match) {
    throw new Error("Invalid URL");
  }

  let search = match[6];
  let hash = match[7];

  if (hash) {
    const splits = hash.split("?");
    if (splits.length === 2) {
      hash = splits[0];
      search = splits[1];
    }
  }

  if (search.startsWith("?")) {
    search = search.slice(1);
  }

  return (
    match && {
      href,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      path: match[5],
      search,
      hash,
    }
  );
};

export const getParseQueryStringFromLocation = (href: string) => {
  const location = getLocation(href);
  const { search } = location;

  return parseQueryString(search);
};

const parseQueryString = (queryString: string) => {
  const params: any = {};
  let temp;
  let i;
  let l;

  // Split into key/value pairs
  const queries = queryString.split("&");

  // Convert the array of strings into an object
  for (i = 0, l = queries.length; i < l; i++) {
    temp = queries[i].split("=");
    params[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
  }

  return params;
};
