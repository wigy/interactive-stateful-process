#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const isDev = process.argv.filter(a => a === '--dev').length > 0
const isBrowser = process.argv.filter(a => a === '--browser').length > 0
const pkg = JSON.parse(require('fs').readFileSync('./package.json'))

async function run() {
  await require('esbuild').build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    incremental: isDev,
    minify: true,
    outfile: 'dist/index.js',
    platform: isBrowser ? 'browser' : 'node',
    sourcemap: 'external',
    watch: isDev && {
      onRebuild(error, result) {
        if (error) console.error('Watch build failed:', error)
        else console.log('Watch build succeeded:', result)
      },
    },
  }).catch((err) => { console.error(err); process.exit(1) })
}

run()
