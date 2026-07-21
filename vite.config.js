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
      { find: 'datatables.net', replacement: nm('datatables.net/js/jquery.dataTables.js') },
      { find: 'datatables.net-buttons', replacement: nm('datatables.net-buttons/js/dataTables.buttons.js') },
      { find: 'datatables.net-buttons-html5', replacement: nm('ouanalyse-datatables.net-buttons-html5/js/buttons.html5.js') },
      { find: 'datatables.net-select', replacement: nm('datatables.net-select/js/dataTables.select.js') },
      { find: 'colvis', replacement: nm('datatables.net-buttons/js/buttons.colVis.js') },
      { find: 'crossfilter', replacement: nm('crossfilter2/crossfilter.js') },
      { find: 'director', replacement: nm('director/build/director.js') },
      { find: 'atlascharts', replacement: js('vendor/atlascharts/main.js') },
      { find: 'lscache', replacement: nm('lscache/lscache.js') },
      { find: 'prism', replacement: nm('prismjs/prism.js') },
      { find: 'prismlanguages', replacement: nm('prismjs/components') },
      { find: 'papaparse', replacement: nm('papaparse/papaparse.js') },
      { find: 'd3', replacement: nm('d3/src/index.js') },
      { find: 'd3-tip', replacement: nm('d3-tip/index.js') },
      { find: 'moment', replacement: nm('moment/moment.js') },
      { find: 'less-js', replacement: nm('less/dist/less.js') },
      { find: 'svgsaver', replacement: nm('svgsaver/browser.js') },
      { find: 'jszip', replacement: nm('jszip/dist/jszip.min.js') },
      { find: 'numeral', replacement: nm('numeral/numeral.js') },
      { find: 'lz-string', replacement: nm('lz-string/libs/lz-string.js') },
      { find: 'colorbrewer', replacement: nm('colorbrewer/index.js') },
      { find: 'ohdsi-api', replacement: nm('@ohdsi/ui-toolbox/lib/umd/api/index.js') },
      { find: 'visibilityjs', replacement: nm('@ohdsi/visibilityjs/lib/visibility.core.js') },
      { find: 'ajv', replacement: nm('ajv/dist/ajv.js') },
      { find: 'html2canvas', replacement: nm('html2canvas/dist/html2canvas.min.js') },
      { find: 'venn', replacement: nm('venn.js/venn.js') },
      { find: 'facets', replacement: nm('facets/facets.js') },
      { find: 'clipboard', replacement: nm('clipboard/dist/clipboard.js') },

      // ── Local asset files ──
      { find: 'assets', replacement: js('assets') },
      { find: 'jnj_chart', replacement: js('assets/jnj.chart.js') },
      { find: 'localStorageExtender', replacement: js('assets/localStorageExtender.js') },
      { find: 'd3-scale-chromatic', replacement: nm('d3-scale-chromatic/src/index.js') },
    ],
  },

  optimizeDeps: {
    // Pre-bundle CJS-only packages so Vite can serve them as ESM in dev mode
    include: [
      'jquery',
      'knockout',
      'bootstrap',
      'director',
      'colorbrewer',
      'prismjs',
      'xss',
      'moment',
      'lodash',
      'numeral',
      'lscache',
      'papaparse',
      'jszip',
    ],
  },

  build: {
    outDir: 'js/assets/bundle',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },

  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: true, // internal dev-only environment, no external exposure
    proxy: {
      '/webapi': {
        target: 'http://169.254.0.2:1248',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webapi/, ''),
      },
    },
  },
})
