export const buildToolExecutionPlan = (query = '', profile = {}) => {
    const normalized = String(query || '').toLowerCase();
    const profileText = [
        profile.goal,
        profile.city,
        profile.interests,
        profile.skills,
        profile.category,
        profile.jobType
    ].filter(Boolean).join(' ').toLowerCase();
    const combined = `${normalized} ${profileText}`;

    const tools = [];

    const mentionJobs = /job|jobs|hiring|career|employment|work|role|opening|recruitment/.test(combined);
    const mentionCourses = /course|courses|training|learning|learn|certificate|certification|skill|upskill/.test(combined);
    const mentionSchemes = /scheme|schemes|grant|scholarship|loan|benefit|welfare|government|maternity|entrepreneur/.test(combined);

    if (mentionJobs) tools.push('searchJobs');
    if (mentionCourses) tools.push('searchCourses');
    if (mentionSchemes) tools.push('searchGovernmentSchemes');

    if (tools.length === 0) {
        return ['searchJobs', 'searchCourses'];
    }

    return tools;
};
