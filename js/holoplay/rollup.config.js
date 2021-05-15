import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/holoplay.js',
    output: {
      file: 'dist/holoplay.js',
      format: 'umd',
      name: 'HoloPlay',
    },
    plugins: [resolve()],
  },
  {
    input: 'src/holoplay.js',
    output: {
      file: 'dist/holoplay.module.js',
      format: 'esm',
    },
    plugins: [resolve()],
  },
]

