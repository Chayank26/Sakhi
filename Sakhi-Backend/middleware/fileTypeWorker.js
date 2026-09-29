import { parentPort, workerData } from 'node:worker_threads';
import { fileTypeFromBuffer } from 'file-type';
try { parentPort.postMessage(await fileTypeFromBuffer(workerData)); }
catch { parentPort.postMessage(null); }
