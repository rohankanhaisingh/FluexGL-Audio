/**
 * This script is used to glue worklet processors into the build process.
 * It reads the worklet files, wraps them in a module, and exports them for use in the main library.
 * 
 * Note: this cannot script cannot be used from a bundler, and is only meant to be run for development/build purposes.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve("./");

const GLUE_PATH = join(ROOT, "lib/_dist/wasm/fluex_dsp.js");
const WORKLETS_DIR = join(ROOT, "lib/src/worklets/src");
const OUT_FILE = join(ROOT, "lib/src/worklets/generated.ts");

function ensureFile(path) {
    if (!existsSync(path)) 
        throw new Error(`File not found: ${path}`);
}

function stripBOM(s) {
    return s.replace(/^\uFEFF/, "");
}

function escapeForTsTemplate(s) {
    return s.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function toTsIdentifier(fileName) {

    const stem = fileName.replace(/\.worklet\.js$/i, "");
    const parts = stem.replace(/[^0-9A-Za-z]+/g, " ").trim().split(/\s+/);

    if (!parts.length) return "Worklet";

    return parts
        .map(p => (/\d/.test(p[0]) ? "_" + p : p))
        .map(p => p[0].toUpperCase() + p.slice(1))
        .join("");
}

function main() {

    ensureFile(GLUE_PATH);

    const glueRaw = stripBOM(readFileSync(GLUE_PATH, "utf8"));
    const glueEsc = escapeForTsTemplate(glueRaw);

    const entries = readdirSync(WORKLETS_DIR, { withFileTypes: true })
        .filter(d => d.isFile() && /\.worklet\.js$/i.test(d.name))
        .map(d => d.name);

    if (!entries.length) 
        throw new Error(`No worklet files found in: ${WORKLETS_DIR}`);

    let out = "";
    out += "/* AUTO-GENERATED - do not edit */\n";

    const mapLines = [];

    for (const file of entries) {

        const id = toTsIdentifier(file);
        const constName = `${id}WorkletSource`;
        const stem = file.replace(/\.worklet\.js$/i, "");

        const workletRaw = stripBOM(readFileSync(join(WORKLETS_DIR, file), "utf8"));
        const workletEsc = escapeForTsTemplate(workletRaw);

        const combined = `${glueEsc}\r\n\r\n${workletEsc}`;

        out += `export const ${constName} = \`${combined}\`;\n\n`;
        mapLines.push(`  "${stem}": ${constName}`);
    }

    out += "export const WORKLETS = {\n";
    out += mapLines.join(",\n");
    out += "\n} as const;\n";
    out += "export type WorkletName = keyof typeof WORKLETS;\n";

    mkdirSync(resolve(OUT_FILE, ".."), { recursive: true });
    writeFileSync(OUT_FILE, out, { encoding: "utf8" });

    console.log(`Generated ${OUT_FILE}`);
    console.log(`Worklets: ${entries.join(", ")}`);
}

main();