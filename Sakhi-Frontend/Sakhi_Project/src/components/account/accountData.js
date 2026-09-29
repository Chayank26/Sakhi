// Only replace shared account state with the /me contract that pages can render.
// Reject incomplete responses instead of presenting missing saved data as empty.
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isRecordList = value => Array.isArray(value) && value.every(item => isRecord(item) && typeof item._id === 'string');

export function isAccountActivity(value) {
    return isRecord(value) && isRecord(value.saved) && isRecord(value.profile)
        && ['jobs', 'courses', 'schemes'].every(kind => isRecordList(value.saved[kind]))
        && isRecordList(value.applications) && isRecordList(value.enrollments);
}
