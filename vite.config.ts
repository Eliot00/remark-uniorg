import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'next-org',
            fileName: 'next-org',
        },
    },
    test: {},
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
})
