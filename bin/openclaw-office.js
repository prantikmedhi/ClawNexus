#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  printHelp,
  resolveConfig,
  parseArgs,
  writePersistedOfficeConfig,
} from "./openclaw-office-config.js";
import { createOfficeServer, formatStartupSummary } from "./openclaw-office-server.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = resolve(__dirname, "..", "dist");

const args = parseArgs();
if (args.help) {
  printHelp();
  process.exit(0);
}

const config = resolveConfig();
if (config.shouldPersistGatewayUrl) {
  writePersistedOfficeConfig(config.gatewayUrl, config.officeConfigPath);
}

const { server } = createOfficeServer({ config, distDir });

server.listen(config.port, config.host, () => {
  console.log(formatStartupSummary(config));
});
