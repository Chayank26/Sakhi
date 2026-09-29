const stringFields = new Set(['title', 'name', 'company', 'recruiterName', 'recruiterEmail', 'description', 'salary', 'location', 'experience', 'education', 'employmentType', 'workingHours', 'applicationDeadline', 'companyLogo', 'website', 'industry', 'createdBy', 'instructor', 'organization', 'instructorEmail', 'duration', 'difficulty', 'language', 'thumbnail', 'banner', 'visibility', 'studentName', 'studentEmail', 'phone', 'userId', 'applicantName', 'applicantEmail', 'applicantPhone', 'applicantUserId', 'coverLetter', 'content', 'category', 'imageUrl', 'targetType', 'targetId', 'reason', 'subject', 'message', 'sessionId', 'clientTurnId', 'role', 'lessonKey', 'status', 'schemeId', 'bio', 'age', 'city', 'goal', 'jobType', 'level', 'feedback']);
const numbers = new Set(['price', 'salaryMinLpa', 'salaryMaxLpa', 'vacancies', 'limit']);
const booleans = new Set(['remote', 'hybrid', 'certificateAvailable', 'saved', 'completed']);
const stringLists = new Set(['responsibilities', 'requirements', 'skills', 'benefits', 'learningOutcomes', 'prerequisites', 'resources', 'interests']);
const structuredArrays = new Set(['curriculum', 'lessonMaterials', 'messages']);
const urls = new Set(['companyLogo', 'website', 'thumbnail', 'banner', 'imageUrl']);
export const httpUrl = value => {
    try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
};
export function validateFields(req, res, next) {
    for (const [key, value] of Object.entries(req.body || {})) {
        let valid = true;
        if (stringFields.has(key)) valid = typeof value === 'string' && value.length <= (['content', 'description', 'coverLetter', 'message'].includes(key) ? 12000 : key === 'bio' ? 2000 : 500);
        else if (numbers.has(key)) valid = ['number', 'string'].includes(typeof value) && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1e7;
        else if (booleans.has(key)) valid = typeof value === 'boolean';
        else if (stringLists.has(key)) valid = typeof value === 'string' || (Array.isArray(value) && value.length <= 100 && value.every(item => typeof item === 'string' && item.length <= 2000));
        else if (structuredArrays.has(key)) valid = Array.isArray(value) && value.every(item => item && typeof item === 'object' && !Array.isArray(item));
        else if (key === 'userProfile') valid = value && typeof value === 'object' && !Array.isArray(value);
        if (valid && urls.has(key) && value) valid = httpUrl(value);
        if (valid && /Email$/.test(key) && value) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (valid && ['sessionId', 'schemeId', 'targetId'].includes(key) && value) valid = /^[a-f\d]{24}$/i.test(value);
        if (valid && key === 'applicationDeadline' && value) valid = Number.isFinite(Date.parse(value));
        if (!valid) return res.status(400).json({ success: false, message: `Invalid ${key}.` });
    }
    if (req.body?.messages?.some(message => !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' || message.content.length > 12000)) return res.status(400).json({ success: false, message: 'Invalid conversation messages.' });
    if (req.body?.lessonMaterials?.some(material => typeof material.lessonKey !== 'string' || (material.content !== undefined && typeof material.content !== 'string') || (material.resourceUrl && !httpUrl(material.resourceUrl)))) return res.status(400).json({ success: false, message: 'Invalid lesson material.' });
    next();
}
