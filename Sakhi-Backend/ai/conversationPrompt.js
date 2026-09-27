import { buildSessionContext } from '../services/aiSessionService.js';

export const buildInputPrompt = ({ prompt, messages }) => {
    const history = buildSessionContext(messages);
    const context = typeof prompt === 'string' ? prompt.trim() : '';
    const transcript = history.map(({ role, content }) =>
        `${role === 'user' ? 'User' : 'Assistant'}: ${content}`).join('\n');

    return [transcript && `CONVERSATION:\n${transcript}`, context].filter(Boolean).join('\n\n');
};
