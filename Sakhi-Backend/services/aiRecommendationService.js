export const buildRecommendationSet = ({ query = '', profile = {}, grounding = {} }) => {
    const jobs = Array.isArray(grounding.jobs) ? grounding.jobs : [];
    const courses = Array.isArray(grounding.courses) ? grounding.courses : [];
    const schemes = Array.isArray(grounding.schemes) ? grounding.schemes : [];

    const recommendations = [];

    jobs.slice(0, 3).forEach((job) => {
        recommendations.push({
            type: 'job',
            title: job.title || 'Recommended job',
            detail: job.company || 'Sakhi job opportunity',
            location: job.location || 'Flexible',
            reason: `Matches your interest in ${profile.goal || 'career growth'} and aligns with ${profile.city || 'your location preferences'}.`
        });
    });

    courses.slice(0, 3).forEach((course) => {
        recommendations.push({
            type: 'course',
            title: course.title || 'Recommended course',
            detail: course.category || 'Skill development',
            location: 'Online',
            reason: `Builds the skills needed for ${profile.goal || 'your next career step'} and supports practical career growth.`
        });
    });

    schemes.slice(0, 2).forEach((scheme) => {
        recommendations.push({
            type: 'scheme',
            title: scheme.name || 'Recommended scheme',
            detail: scheme.category || 'Support opportunity',
            location: scheme.state || 'India',
            reason: `This option is relevant for financial or welfare support and may fit your platform goals and eligibility profile.`
        });
    });

    if (recommendations.length === 0) {
        return {
            recommendations: [{
                type: 'general',
                title: 'Ask a more specific question',
                detail: 'Tell me your goal, city, or area of interest.',
                location: 'General',
                reason: 'A clearer goal will let the assistant give better, more relevant guidance.'
            }]
        };
    }

    return {
        query: String(query || '').trim(),
        recommendations
    };
};
