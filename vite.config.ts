import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function preRenderStaticPagesPlugin(): Plugin {
  return {
    name: 'prerender-static-pages',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.resolve(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      const baseHtml = fs.readFileSync(indexPath, 'utf-8');

      // 1. /practice static page
      const practiceDir = path.resolve(distDir, 'practice');
      fs.mkdirSync(practiceDir, { recursive: true });
      const practiceHtml = baseHtml
        .replace(
          /<title>.*?<\/title>/,
          '<title>Linear System Elimination Practice Workshop – Interactive Quiz & Strategy | 消元自测演练场</title>'
        )
        .replace(
          /<meta\s+name="description"\s+content=".*?"\s*\/>/,
          '<meta name="description" content="Interactive practice workshop for secondary algebra: master substitution and elimination method selection with real-time feedback and hints. 初一代数消元思维互动自测。" />'
        )
        .replace(
          /<link\s+rel="canonical"\s+href=".*?"\s*\/>/,
          '<link rel="canonical" href="https://linear-system-solver.formulacalckit.com/practice" />'
        );
      fs.writeFileSync(path.resolve(practiceDir, 'index.html'), practiceHtml, 'utf-8');

      // 2. /guide static page
      const guideDir = path.resolve(distDir, 'guide');
      fs.mkdirSync(guideDir, { recursive: true });
      const guideHtml = baseHtml
        .replace(
          /<title>.*?<\/title>/,
          '<title>Linear Systems & Elimination Guide – Methods, Geometry, Determinants & Pitfalls | 核心考点指南</title>'
        )
        .replace(
          /<meta\s+name="description"\s+content=".*?"\s*\/>/,
          '<meta name="description" content="Comprehensive curriculum guide covering substitution vs elimination criteria, algebraic pitfalls, coordinate geometry, and Cramer’s rule. 一次方程组与消元法核心考点指南。" />'
        )
        .replace(
          /<link\s+rel="canonical"\s+href=".*?"\s*\/>/,
          '<link rel="canonical" href="https://linear-system-solver.formulacalckit.com/guide" />'
        );
      fs.writeFileSync(path.resolve(guideDir, 'index.html'), guideHtml, 'utf-8');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), preRenderStaticPagesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
