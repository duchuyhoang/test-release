process.env.AUTHORITY_URL = "https://oidc.dev.dentity.com";

expect.extend({
  toBeNonEmptyArray(value: any) {
    const isPass = Array.isArray(value) && value.length > 0;
    return {
      pass: isPass,
      message: () => (isPass ? "" : `Expect a non empty array`),
    };
  },
});
