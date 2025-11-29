import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distSrcDir = path.resolve(__dirname, "dist/nodejs/src");

// Recursively walk all JS files in dist
function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
            walk(full);
        } else if (full.endsWith(".js")) {
            rewriteImports(full);
        }
    }
}

// Rewrite alias imports to relative paths
function rewriteImports(file) {
    let code = fs.readFileSync(file, "utf8");

    // Match all ES module imports with .js
    const importRegex = /from\s+["']([a-zA-Z0-9_\-\/]+\.js)["']/g;

    code = code.replace(importRegex, (match, importPath) => {
        // Only process imports that are not relative (no ./ or ../)
        if (importPath.startsWith("./") || importPath.startsWith("../")) {
            return match; // skip relative imports
        }

        // Compute absolute path in dist
        const targetFile = path.resolve(distSrcDir, importPath);

        if (!fs.existsSync(targetFile)) {
            console.warn(`File not found: ${targetFile}, skipping`);
            return match;
        }

        // Compute relative path from current file
        let relPath = path.relative(path.dirname(file), targetFile);
        if (!relPath.startsWith(".")) relPath = "./" + relPath;
        relPath = relPath.replace(/\\/g, "/");

        return `from "${relPath}"`;
    });

    fs.writeFileSync(file, code, "utf8");
}

// Run
walk(distSrcDir);
console.log("All absolute alias imports rewritten to relative paths in dist/nodejs");
