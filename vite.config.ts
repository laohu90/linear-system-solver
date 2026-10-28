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

      // Helper to generate static route html
      const emitStaticRoute = (subDir: string, title: string, desc: string, canonical: string) => {
        const targetDir = path.resolve(distDir, subDir);
        fs.mkdirSync(targetDir, { recursive: true });
        const html = baseHtml
          .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(
            /<meta\s+name="description"\s+content=".*?"\s*\/>/,
            `<meta name="description" content="${desc}" />`
          )
          .replace(
            /<link\s+rel="canonical"\s+href=".*?"\s*\/>/,
            `<link rel="canonical" href="${canonical}" />`
          );
        fs.writeFileSync(path.resolve(targetDir, 'index.html'), html, 'utf-8');
      };

      // 1. /practice
      emitStaticRoute(
        'practice',
        'Linear System Elimination Practice Workshop – Interactive Quiz & Strategy | 消元自测演练场',
        'Interactive practice workshop for secondary algebra: master substitution and elimination method selection with real-time feedback and hints. 初一代数消元思维互动自测。',
        'https://linear-system-solver.formulacalckit.com/practice'
      );

      // 2. /problem-bank
      emitStaticRoute(
        'problem-bank',
        'Linear System Problem Bank – Curated Secondary Algebra & Word Problems | 经典题库精选',
        'Curated linear system problem sets, algebra foundations, parentheses & fractions transformations, and classic applied word problems with step-by-step solutions.',
        'https://linear-system-solver.formulacalckit.com/problem-bank'
      );

      // 3. /guide
      emitStaticRoute(
        'guide',
        'Linear Systems & Elimination Guide – Methods, Geometry, Determinants & Pitfalls | 核心考点指南',
        'Comprehensive curriculum guide covering substitution vs elimination criteria, algebraic pitfalls, coordinate geometry, and Cramer’s rule. 一次方程组与消元法核心考点指南。',
        'https://linear-system-solver.formulacalckit.com/guide'
      );

      // 4. /privacy
      emitStaticRoute(
        'privacy',
        'Privacy Policy & Data Security – Linear System Solver | 隐私政策与数据安全说明',
        '100% In-browser local mathematical computation. Zero third-party tracking, zero external data transmission, fully compliant with student privacy.',
        'https://linear-system-solver.formulacalckit.com/privacy'
      );
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
