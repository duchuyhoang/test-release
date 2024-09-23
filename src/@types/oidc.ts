export interface OidcServerConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported: string[];
  response_modes_supported?: string[];
  grant_types_supported?: string[];
  acr_values_supported?: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  id_token_encryption_alg_values_supported?: string[];
  id_token_encryption_enc_values_supported?: string[];
  userinfo_signing_alg_values_supported?: string[];
  userinfo_encryption_alg_values_supported?: string[];
  userinfo_encryption_enc_values_supported?: string[];
  request_object_signing_alg_values_supported?: string[];
  request_object_encryption_alg_values_supported?: string[];
  request_object_encryption_enc_values_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  token_endpoint_auth_signing_alg_values_supported?: string[];
  display_values_supported?: string[];
  claim_types_supported?: string[];
  claims_supported?: string[];
  claims_locales_supported?: string[];
  ui_locales_supported?: string[];
  service_documentation?: string;
  claims_parameter_supported?: boolean;
  request_parameter_supported?: boolean;
  request_uri_parameter_supported?: boolean;
  require_request_uri_registration?: boolean;
  op_policy_uri?: string;
  op_tos_uri?: string;

  // instropection
  introspection_endpoint?: string;
  introspection_endpoint_auth_methods_supported?: string;
  introspection_endpoint_auth_signing_alg_values_supported?: string;

  // revocation
  revocation_endpoint?: string;
  revocation_endpoint_auth_methods_supported?: string[];
  revocation_endpoint_auth_signing_alg_values_supported?: string[];
}

export interface OidcClientConfiguration {
  configurationName: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scope: string;
  authority: string;
  extras?: Record<string, string>;
}

export interface OidcConfiguration extends OidcClientConfiguration {
  // ensName?: string;
  // federatedToken?: string;
}

export type ExportEventFunc = (eventName: string, data: any) => void;

export type ResponseType = "code";
