export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const publicAuthor = author => ({ uid: author?.uid, name: author?.name, avatar: author?.avatar || null, role: author?.role || 'Community Member' });
