export const createSessionTitle = (text = '') => {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();

  if (!cleaned) return 'New conversation';
  if (cleaned.length <= 30) return cleaned;

  return `${cleaned.slice(0, 27).trim()}...`;
};

export const buildSessionList = (messages = [], previous = []) => {
  const currentConversation = Array.isArray(messages) ? messages.filter((message) => message && typeof message.text === 'string' && message.text.trim()) : [];

  const latestUserMessage = [...currentConversation].reverse().find((message) => message.sender === 'user')?.text || '';
  const title = createSessionTitle(latestUserMessage || 'Sakhi AI');
  const preview = latestUserMessage || 'Start a new Sakhi AI conversation';

  const nextSession = {
    id: `session-${Date.now()}`,
    title,
    preview,
    createdAt: new Date().toISOString()
  };

  return [nextSession, ...Array.isArray(previous) ? previous : []].slice(0, 6);
};
