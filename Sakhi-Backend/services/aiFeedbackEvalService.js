export const evaluateResponseQuality = ({ answer = '', query = '', recommendationCount = 0 }) => {
    const normalizedAnswer = String(answer || '').trim();
    const normalizedQuery = String(query || '').trim();

    let score = 50;

    if (normalizedAnswer.length > 80) score += 15;
    if (normalizedQuery.length > 0) score += 10;
    if (recommendationCount > 0) score += 10;
    if (/job|course|scheme|recommend|next step|why/i.test(normalizedAnswer)) score += 15;

    if (!normalizedAnswer || !normalizedQuery) {
        return {
            score: 0,
            quality: 'poor',
            reason: 'Missing answer or query context.'
        };
    }

    if (score >= 85) {
        return {
            score,
            quality: 'good',
            reason: 'Response is detailed, relevant, and actionable.'
        };
    }

    return {
        score,
        quality: 'average',
        reason: 'Response is somewhat useful but could be more specific.'
    };
};

export const summarizeFeedback = (feedbackEntries = []) => {
    const total = Array.isArray(feedbackEntries) ? feedbackEntries : [];

    return {
        up: total.filter((entry) => entry && entry.rating === 'up').length,
        down: total.filter((entry) => entry && entry.rating === 'down').length,
        total: total.length
    };
};

// Heuristic review signals, not a claim of factual accuracy or an LLM evaluation.
export const summarizeResponseSignals = (messages = []) => {
    const replies = messages.filter((message) => message.role === 'assistant');
    const scored = replies.filter((message) => Number.isFinite(message.quality?.score));
    return {
        replies: replies.length,
        averageScore: scored.length ? Math.round(scored.reduce((sum, message) => sum + message.quality.score, 0) / scored.length) : null,
        feedback: summarizeFeedback(replies.map((message) => message.feedback).filter((feedback) => feedback?.rating)),
        needsReview: replies.filter((message) => message.feedback?.rating === 'down' || message.quality?.score < 85).length
    };
};
