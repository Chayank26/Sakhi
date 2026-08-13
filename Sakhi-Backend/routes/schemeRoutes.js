import express from 'express';
import {
    getSchemes,
    getSchemeById,
    searchSchemes,
    getSchemesByCategory
} from '../controllers/schemeController.js';
import {
    getAiContextData,
    checkEligibility,
    recommendSchemes
} from '../controllers/schemeAiController.js';

const router = express.Router();

// Public Read Endpoints
router.get('/', getSchemes);
router.get('/search', searchSchemes);
router.get('/category/:category', getSchemesByCategory);

// Sakhi AI Integration & Abstraction Endpoints
router.get('/ai/context', getAiContextData);
router.post('/ai/check-eligibility', checkEligibility);
router.post('/ai/recommend', recommendSchemes);

// Single Scheme ID Endpoint (must remain last)
router.get('/:id', getSchemeById);

export default router;
