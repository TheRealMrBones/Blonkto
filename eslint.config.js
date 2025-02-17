import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["src/**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            import: importPlugin
        },
        rules: {
            "no-undef": "off",
            "no-empty": "off",
            "no-unused-vars": "off",
            "no-prototype-builtins": "off",
            "prefer-const": "error",
            "indent": ["error", 4, { "SwitchCase": 1 }],
            "semi": ["error", "always"],
            "quotes": ["error", "double"],
            "import/extensions": ["error", "always", { "js": "always", "ts": "always" }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    "selector": "typeLike",
                    "format": ["PascalCase"],
                    "leadingUnderscore": "allow",
                },
                {
                    "selector": "enumMember",
                    "format": ["UPPER_CASE"],
                },
                {
                    "selector": "function",
                    "format": ["camelCase"],
                },
                {
                    "selector": "method",
                    "format": ["camelCase"],
                },
            ],
        },
    },
];
