import multer from 'multer';
import { Worker } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { uploadRoot } from '../config/runtime.js';
import { validateFields } from './validation.js';
import { validPayload } from './security.js';

export function detectFileType(buffer) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./fileTypeWorker.js', import.meta.url), { workerData: buffer, resourceLimits: { maxOldGenerationSizeMb: 64 }, execArgv: [] });
        const timer = setTimeout(() => { void worker.terminate(); reject(new Error('File inspection timed out.')); }, 3000);
        worker.once('message', result => { clearTimeout(timer); void worker.terminate(); resolve(result); });
        worker.once('error', error => { clearTimeout(timer); reject(error); });
        worker.once('exit', code => { clearTimeout(timer); if (code !== 0) reject(new Error('File inspection failed.')); });
    });
}
const formats = {
    resume: new Map([['pdf', 'application/pdf'], ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]),
    image: new Map([['jpg', 'image/jpeg'], ['png', 'image/png'], ['gif', 'image/gif'], ['webp', 'image/webp']]),
};
export function isAllowedFile(kind, detected, declaredMime) {
    return Boolean(detected && formats[kind]?.has(detected.ext) && formats[kind].get(detected.ext) === detected.mime && detected.mime === declaredMime?.toLowerCase().replace('image/jpg', 'image/jpeg'));
}
export function secureUpload(kind, { root = uploadRoot, detect = detectFileType } = {}) {
    const parse = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, parts: 21, fieldSize: 12000, fieldNameSize: 100 } }).single(kind);
    return (req, res, next) => parse(req, res, async error => {
        if (error) return next(error);
        if (!req.file) return res.status(400).json({ success: false, message: 'A file is required.' });
        let destination;
        try {
            if (!validPayload(req.body)) throw new Error('Invalid upload fields.');
            let fieldsValid = false;
            validateFields(req, res, () => { fieldsValid = true; });
            if (!fieldsValid) return;
            const detected = await detect(req.file.buffer);
            if (!isAllowedFile(kind, detected, req.file.mimetype)) return res.status(400).json({ success: false, message: kind === 'resume' ? 'Upload a valid PDF or DOCX resume.' : 'Upload a valid JPEG, PNG, GIF, or WebP image.' });
            const directory = path.join(root, kind === 'resume' ? 'resumes' : 'community');
            await mkdir(directory, { recursive: true, mode: 0o700 });
            const filename = `${kind === 'resume' ? 'resume' : 'community'}-${randomUUID()}.${detected.ext}`;
            destination = path.join(directory, filename);
            await writeFile(destination, req.file.buffer, { flag: 'wx', mode: 0o600 });
            req.file = { ...req.file, buffer: undefined, filename, path: destination, mimetype: detected.mime };
            next();
        } catch {
            if (destination) await unlink(destination).catch(() => {});
            res.status(400).json({ success: false, message: 'Could not validate or store this upload. Please try another file.' });
        }
    });
}
