export interface VpToken {
  "@context": Array<string | { "@vocab": string }>;
  id: string;
  type: Array<string>;
  credentialSchema: {
    id: string;
    type: string;
  };
  credentialStatus: {
    id: string;
    type: string;
    revocationListCredential: string;
    revocationListIndex: string;
  };
  credentialSubject: {
    id: string;
    credentialIssuer: string;
    credentialType: string;
    name: string;
    verificationSource: string;
  };
  issuanceDate: string;
  issuer: string;
  proof: {
    type: string;
    created: string;
    nonce: string;
    proofPurpose: string;
    proofValue: string;
    verificationMethod: string;
  };
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  scope: string;
  token_type: string;
}
export interface OIDCResponseError {
  error: string;
  error_description: string;
}
