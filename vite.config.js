import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const js = (rel) => path.resolve(__dirname, 'js', rel)
const nm = (rel) => path.resolve(__dirname, 'node_modules', rel)

export default defineConfig({
  base: '/atlas/',
  plugins: [
    legacy({
      targets: ['> 0.5%', 'last 2 versions', 'not dead'],
    }),
  ],

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // required for Bootstrap-based LESS files
      },
    },
  },

  resolve: {
    alias: [
      // ── App config ──
      { find: 'appConfig', replacement: js('config.js') },
      { find: 'const-state', replacement: js('const-state.js') },
      { find: 'version', replacement: js('version.js') },

      // ── AMD map: jqueryui local overrides ──
      { find: 'jqueryui/jquery.ddslick', replacement: js('assets/jqueryui/jquery.ddslick.js') },
      { find: 'jqueryui/autoGrowInput', replacement: js('assets/jqueryui/autoGrowInput.js') },

      // ── AMD map: renamed service ──
      { find: 'services/VocabularyProvider', replacement: js('services/Vocabulary.js') },

      // ── localRefs: component aliases ──
      { find: 'atlas-state', replacement: js('components/atlas-state.js') },
      { find: 'configuration', replacement: js('components/configuration') },
      { find: 'conceptset-editor', replacement: js('components/conceptset/conceptset-editor.js') },
      { find: 'conceptset-modal', replacement: js('components/conceptsetmodal/conceptSetSaveModal.js') },
      { find: 'user-bar', replacement: js('components/userbar/user-bar.js') },
      { find: 'faceted-datatable', replacement: js('components/faceted-datatable.js') },
      { find: 'r-manager', replacement: js('components/r-manager.js') },
      { find: 'home', replacement: js('components/home.js') },
      { find: 'welcome', replacement: js('components/welcome.js') },
      { find: 'forbidden', replacement: js('components/ac-forbidden.js') },
      { find: 'unauthenticated', replacement: js('components/ac-unauthenticated.js') },
      { find: 'roles', replacement: js('components/roles.js') },
      { find: 'role-details', replacement: js('components/role-details.js') },
      { find: 'loading', replacement: js('components/loading.js') },
      { find: 'feedback', replacement: js('components/feedback.js') },
      { find: 'conceptpicker', replacement: js('components/conceptpicker') },

      // ── packages: AMD directory packages → bare→main.js, sub-path→directory ──
      { find: /^databindings$/, replacement: js('extensions/bindings/main.js') },
      { find: /^databindings\//, replacement: js('extensions/bindings') + '/' },
      { find: /^cohortdefinitionviewer$/, replacement: js('components/cohortdefinitionviewer/main.js') },
      { find: /^cohortdefinitionviewer\//, replacement: js('components/cohortdefinitionviewer') + '/' },
      { find: /^circe$/, replacement: js('components/circe/main.js') },
      { find: /^circe\//, replacement: js('components/circe') + '/' },
      { find: /^cyclops$/, replacement: js('components/cyclops/main.js') },
      { find: /^cyclops\//, replacement: js('components/cyclops') + '/' },
      { find: /^evidence$/, replacement: js('components/evidence/main.js') },
      { find: /^evidence\//, replacement: js('components/evidence') + '/' },
      { find: /^extenders$/, replacement: js('extenders') },
      { find: /^extenders\//, replacement: js('extenders') + '/' },
      { find: /^featureextraction\//, replacement: js('components/featureextraction') + '/' },
      { find: /^utilities\//, replacement: js('components/utilities') + '/' },

      // ── AMD baseUrl directory aliases (bare module names resolve under js/) ──
      { find: /^pages$/, replacement: js('pages/main.js') },
      { find: /^pages\//, replacement: js('pages') + '/' },
      { find: /^services\//, replacement: js('services') + '/' },
      { find: /^utils\//, replacement: js('utils') + '/' },
      { find: /^components\//, replacement: js('components') + '/' },
      { find: /^config\//, replacement: js('config') + '/' },
      { find: /^extensions\//, replacement: js('extensions') + '/' },
      { find: 'const', replacement: js('const.js') },

      // ── paths: npm packages with non-standard dist files ──
      { find: 'knockout', replacement: nm('knockout/build/output/knockout-latest.js') },
      { find: 'ko.sortable', replacement: js('ko-sortable-setup.js') },
      { find: 'jquery', replacement: nm('jquery/dist/jquery.js') },
      { find: 'bootstrap', replacement: nm('bootstrap/dist/js/bootstrap.esm.js') },
      { find: 'datatables.net', replacement: nm('datatables.net/js/dataTables.mjs') },
      { find: 'datatables.net-buttons', replacement: nm('datatables.net-buttons/js/dataTables.buttons.mjs') },
      { find: 'datatables.net-buttons-html5', replacement: nm('datatables.net-buttons/js/buttons.html5.mjs') },
      { find: 'datatables.net-select', replacement: nm('datatables.net-select/js/dataTables.select.mjs') },
      { find: 'colvis', replacement: nm('datatables.net-buttons/js/buttons.colVis.mjs') },
      // pdfmake is pinned to 0.2.x in package.json on purpose (see CHANGELOG.md) -
      // that line ships this prebuilt build/pdfmake.js + build/vfs_fonts.js pair.
      // 0.3.x dropped them for a from-source, bundler-oriented build requiring
      // new @foliojs-fork/* peer deps - upgrading means redoing this aliasing,
      // not a version bump.
      { find: 'pdfmake/vfs_fonts', replacement: nm('pdfmake/build/vfs_fonts.js') },
      { find: 'pdfmake', replacement: nm('pdfmake/build/pdfmake.js') },
      { find: 'atlascharts', replacement: js('vendor/atlascharts/main.js') },
      { find: 'prism', replacement: nm('prismjs/prism.js') },
      { find: 'prismlanguages', replacement: nm('prismjs/components') },
      { find: 'papaparse', replacement: nm('papaparse/papaparse.js') },
      { find: 'd3', replacement: nm('d3/src/index.js') },
      { find: 'd3-tip', replacement: nm('d3-tip/index.js') },
      { find: 'less-js', replacement: nm('less/dist/less.js') },
      { find: 'svgsaver', replacement: nm('svgsaver/browser.js') },
      { find: 'jszip', replacement: nm('jszip/dist/jszip.min.js') },
      { find: 'lz-string', replacement: nm('lz-string/libs/lz-string.js') },
      { find: 'ohdsi-api', replacement: nm('@ohdsi/ui-toolbox/lib/umd/api/index.js') },
      { find: 'html2canvas', replacement: nm('html2canvas/dist/html2canvas.min.js') },

      // ── Local asset files ──
      { find: 'assets', replacement: js('assets') },
      { find: 'jnj_chart', replacement: js('assets/jnj.chart.js') },
    ],
  },

  optimizeDeps: {
    // Pre-bundle CJS-only packages so Vite can serve them as ESM in dev mode
    include: [
      'jquery',
      'knockout',
      'bootstrap',
      'prismjs',
      'xss',
      'lodash',
      'papaparse',
      'jszip',
    ],
  },

  build: {
    outDir: 'js/assets/bundle',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      // No `output.manualChunks` here on purpose. Rollup's default chunking is
      // correct for this codebase (verified: zero cycles in the emitted chunk
      // graph), and hand-grouping is a trap -- js/main.js hand-sequences its
      // dynamic imports, assigning window.jQuery after importing jquery but
      // before pulling in the UMD vendor files that read that global.
      // Coalescing app code pulls jquery and those UMD files into one eagerly
      // evaluated chunk, and Vite's preload helper then gives the entry chunk a
      // *static* edge into it, so it runs before the assignment and the boot
      // dies with "jQuery is not defined".
      //
      // Chunking problems only ever surface in the production build -- the dev
      // server serves unbundled modules in a working order -- so verify any
      // change here by loading a real production build in a browser, never
      // `npm run dev`. See MIGRATION_STATUS.md for why we are on Vite 7.
    },
  },

  server: {
    port: 5173,
    host: '0.0.0.0',
    // Explicit allowlist rather than `true`. This is the Host-header check that
    // blocks DNS-rebinding attacks against the dev server: with `true`, any
    // site a developer visits can resolve its own hostname to this machine and
    // read whatever the dev server will serve -- which matters because Vite's
    // recurring CVE class is exactly `server.fs.deny` bypasses. Add a hostname
    // here when you need to reach the dev server under a new name.
    allowedHosts: [
      // Public names, reached through the nginx reverse proxies. Those pass
      // `proxy_set_header Host $host`, so the dev server sees these names, not
      // the backend's.
      'chi-dev.uc.edu',
      'dev.lastchance.pub',
      // The backend's own name/address, for hitting :5173 directly, bypassing
      // the proxy.
      'work.lastchance.pub',
      '192.168.1.233',
      'localhost',
    ],
    proxy: {
      '/webapi': {
        target: 'http://169.254.0.2:1248',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webapi/, ''),
      },
    },
  },
})
