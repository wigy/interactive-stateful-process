#!/usr/bin/env node
const isDev = process.argv.filter(a => a === '--dev').length > 0

async function run() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await require('esbuild').build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: !isDev,
    incremental: isDev,
    platform: 'node',
    sourcemap: 'external',
    watch: isDev && {
      onRebuild(error, result) {
        if (error) console.error('Watch build failed:', error)
        else console.log('Watch build succeeded:', result)
      },
    },
    outfile: 'dist/index.js',
  }).catch((err) => { console.error(err); process.exit(1)})
}

run()
