import express from 'express';
import {
    getSchemes,
    getSchemeById,
    searchSchemes,
    getSchemesByCategory
} from '../controllers/schemeController.js';

const router = express.Router();

// Public Read Endpoints
router.get('/', getSchemes);
router.get('/search', searchSchemes);
router.get('/category/:category', getSchemesByCategory);
router.get('/:id', getSchemeById);

export default router;
