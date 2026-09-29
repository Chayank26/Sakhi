import test from 'node:test';
import assert from 'node:assert/strict';
import { isAccountActivity } from '../src/components/account/accountData.js';

const valid = { saved: { jobs: [], courses: [{ _id: 'course-1', title: 'Learning' }], schemes: [] }, applications: [], enrollments: [], profile: {} };

test('account activity accepts the current backend contract', () => {
    assert.equal(isAccountActivity(valid), true);
    assert.equal(isAccountActivity({ ...valid, success: true }), true);
});

test('incomplete or malformed account responses cannot replace safe shared state', () => {
    for (const value of [undefined, null, '', '<html>fallback</html>', {}, { success: true, profile: {} },
        { ...valid, saved: undefined }, { ...valid, saved: { courses: [] } },
        { ...valid, saved: { ...valid.saved, courses: null } },
        { ...valid, saved: { ...valid.saved, courses: [null] } },
        { ...valid, saved: { ...valid.saved, courses: ['course-1'] } },
        { ...valid, applications: {} }, { ...valid, enrollments: [null] }, { ...valid, profile: null }]) {
        assert.equal(isAccountActivity(value), false);
    }
});
