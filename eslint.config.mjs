import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextConfig from "eslint-config-next/core-web-vitals";

export default defineConfig([
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "src/components/ui/**",
        "**/__temp/**",
        "windows/**",
        "src/fonts/**",
        "src/styles/**",
    ]),
    ...nextConfig,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/consistent-type-imports": [
                "warn",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/dot-notation": "off",
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: { attributes: false } },
            ],
            "@next/next/no-img-element": "off",
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-inferrable-types": "off",
        },
    },
    {
        files: ["**/*.config.js"],
        rules: {
            "import/no-anonymous-default-export": "off",
        },
    },
    {
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["eslint.config.mjs"],
                    defaultProject: "tsconfig.json",
                },
            },
        },
    },
]);
