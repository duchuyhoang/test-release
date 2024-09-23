const NULL_VALUE = String(null);

export class OidcStorage {
  constructor(public options: { configurationName: string }) {}
  public setStateAsync(value?: string) {
    const key = `oidc.state.${this.options.configurationName}`;
    if (value) localStorage[key] = value;
    else {
      localStorage[key] = NULL_VALUE;
    }
  }

  public getStateAsync() {
    const data = localStorage[`oidc.state.${this.options.configurationName}`];
    return String(data) === NULL_VALUE ? null : data;
  }
}
