// vite.config.js
import legacy from '@vitejs/plugin-legacy';

export default {
  base: './',
  plugins: [legacy()],
  assetsInclude: /.*\.m4a$/,
};
