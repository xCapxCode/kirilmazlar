/**
 * Build Configuration for Auto Task Progression Package
 * @package @kirilmazlar/auto-task-progression
 */

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';

export default defineConfig([
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: [
      'react',
      'fs-extra',
      'cross-spawn',
      'glob',
      'path'
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      json(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              node: '14'
            }
          }],
          '@babel/preset-react'
        ]
      }),
      terser({
        compress: {
          drop_console: false // Keep console statements for logging
        }
      })
    ]
  },

  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external: [
      'react',
      'fs-extra',
      'cross-spawn',
      'glob',
      'path'
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      json(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: {
              node: '14'
            }
          }],
          '@babel/preset-react'
        ]
      })
    ]
  }
]);
