/**
 * This script is used to glue worklet processors into the build process.
 * It reads the worklet files, wraps them in a module, and exports them for use in the main library.
 * 
 * Note: this cannot script cannot be used from a bundler, and is only meant to be run for development/build purposes.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const rootDirectory = resolve(__dirname, "..");

const glueSourceFilePath = resolve(rootDir, "lib", "_dist", "wasm", "fluex_dsp.js");
const workletDirectory = resolve(rootDir, "lib", "src", "worklets");