import { loadEnv } from 'vite';
import { releaseConfigErrors } from './release-config.js';

const errors = releaseConfigErrors({ ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env });
for (const error of errors) console.error(`[Release configuration] ${error}`);
if (errors.length) process.exitCode = 1;
else console.log('[Release configuration] Frontend settings are explicit and structurally valid. Live access is not verified.');
