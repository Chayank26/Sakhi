export const buildChatTranscript = (messages, exportedAt = new Date()) => {
  const turns = messages.filter((message) => !message.isError && !message.failed).map((message) => {
    const details = Object.values(message.cards || {}).flat().filter(Boolean).map((record) =>
      [record.title || record.name, record.company || record.category, record.recommendationReason].filter(Boolean).join(' — '));
    const actions = (message.actions || []).map((action) => `${action.label}: ${action.route}`);
    return [`[${message.timestamp}] ${message.sender === 'user' ? 'YOU' : 'SAKHI AI'}:`, message.text, ...details, ...actions].join('\n');
  });
  return `SAKHI AI CONVERSATION\nExported: ${exportedAt.toISOString()}\n\n${turns.join('\n\n----------------------------------------\n\n')}`;
};
