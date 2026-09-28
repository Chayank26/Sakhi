import test from 'node:test';
import assert from 'node:assert/strict';
import { safeHttpUrl } from '../src/utils/safeUrl.js';

test('scheme and learning resource links allow only absolute HTTP(S) destinations', () => {
    assert.equal(safeHttpUrl('https://example.gov.in/apply'), 'https://example.gov.in/apply');
    assert.equal(safeHttpUrl('http://example.org/course'), 'http://example.org/course');
    for (const value of ['javascript:alert(1)', 'data:text/html,example', '/local-path', undefined, '']) assert.equal(safeHttpUrl(value), null);
});
