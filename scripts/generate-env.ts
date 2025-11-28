import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { mkdirSync } from 'fs';

const isProd = process.env['NODE_ENV'] === 'production';

const envFile = `export const environment = {
  backendURL: '${process.env['VITE_BACKEND_URL'] || 'http://localhost:3000'}',
  supabaseUrl: '${process.env['VITE_SUPABASE_URL'] || ''}',
  supabaseKey: '${process.env['VITE_SUPABASE_KEY'] || ''}',
  production: ${isProd},
  oauth: {
    google: {
      clientId: '${process.env['VITE_GOOGLE_CLIENT_ID'] || ''}',
    },
    github: {
      clientId: '${process.env['VITE_GITHUB_CLIENT_ID'] || ''}',
    },
  },
  siteUrl: '${process.env['VITE_SITE_URL'] || 'http://localhost:4200'}',
};
`;

const targetPath = isProd
  ? resolve(__dirname, '../src/environments/environment.ts')
  : resolve(__dirname, '../src/environments/environment.development.ts');

// Ensure directory exists
const dir = dirname(targetPath);
mkdirSync(dir, { recursive: true });

writeFileSync(targetPath, envFile);
console.log(`✅ Environment file generated at: ${targetPath}`);
console.log(`📦 Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
