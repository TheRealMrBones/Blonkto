import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["src/**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "no-undef": "off",
            "no-empty": "off",
            "no-unused-vars": "off",
            "no-prototype-builtins": "off",
            "prefer-const": "error",
            "indent": ["error", 4, { "SwitchCase": 1 }],
            "semi": ["error", "always"],
            "quotes": ["error", "double"],
        }
    },
];
