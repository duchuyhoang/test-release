import { Config } from "jest";
const configs: Config = {
  preset: "ts-jest",
  rootDir: ".",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).+(ts|js)"],
  verbose: true,

  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        diagnostics: false,
        tsConfig: "tsconfig.json",
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/setEnvVar.ts"],
  silent: false,
};

export default configs;
