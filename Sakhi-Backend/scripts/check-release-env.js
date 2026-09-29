import 'dotenv/config';
import { releaseConfigErrors } from '../config/release.js';
const errors = releaseConfigErrors(process.env);
for (const error of errors) console.error(`[Release configuration] ${error}`);
if (errors.length) process.exitCode = 1;
else console.log('[Release configuration] Backend settings are structurally valid. Live services and persistent storage still need verification.');
