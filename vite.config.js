// vite.config.js
import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [legacy()],
  assetsInclude: /.*\.m4a$/,
};
