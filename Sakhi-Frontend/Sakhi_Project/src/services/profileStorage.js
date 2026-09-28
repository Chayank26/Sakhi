export const readLocalProfile = (user, storage = localStorage) => {
    if (!user?.uid) return {};
    try {
        const saved = JSON.parse(storage.getItem(`sakhi_profile_${user.uid}`) || 'null');
        if (saved && typeof saved === 'object') return saved;
        const legacy = JSON.parse(storage.getItem('sakhi_user_profile') || '{}');
        return legacy?.uid === user.uid || (legacy?.email && legacy.email === user.email) ? legacy : {};
    } catch { return {}; }
};
export const saveLocalProfile = (user, profile, storage = localStorage) => {
    if (!user?.uid) return;
    const value = JSON.stringify({ ...profile, uid: user.uid });
    storage.setItem(`sakhi_profile_${user.uid}`, value);
    storage.setItem('sakhi_user_profile', value);
};
