import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldSendOnEnter, safeChatRoute, recommendationRoute, formatCoursePrice, retryDelayMs } from '../src/components/pages/ai/chatUiUtils.js';

test('Enter submits, while multiline and IME composition preserve input', () => {
  assert.equal(shouldSendOnEnter({ key: 'Enter' }), true);
  for (const extra of [{ shiftKey: true }, { nativeEvent: { isComposing: true } }, { isComposing: true }, { keyCode: 229 }]) assert.equal(shouldSendOnEnter({ key: 'Enter', ...extra }), false);
  assert.equal(shouldSendOnEnter({ key: 'a' }), false);
});
test('AI actions stay on supported local routes', () => {
  for (const route of ['/jobs?q=remote', '/academy/course/abc', '/home', '/profile']) assert.equal(safeChatRoute(route), route);
  for (const route of ['https://evil.test', '//evil.test', '/jobs\\evil', '/jobsevil', 'javascript:alert(1)', null]) assert.equal(safeChatRoute(route), null);
});
test('recommendations open record details or an encoded directory search', () => {
  const id = '507f1f77bcf86cd799439011';
  assert.equal(recommendationRoute('job', { jobId: id }), `/jobs/${id}`);
  assert.equal(recommendationRoute('course', { _id: id }), `/academy/course/${id}`);
  assert.equal(recommendationRoute('scheme', { schemeId: id }), `/schemes/${id}`);
  assert.equal(recommendationRoute('course', { title: 'C++ & Python', courseId: '../bad' }), '/academy?q=C%2B%2B%20%26%20Python');
  assert.equal(recommendationRoute('job', {}), '/jobs');
  assert.equal(formatCoursePrice(0), 'Free');
  assert.equal(formatCoursePrice(1500), '₹1,500');
});
test('retry delay handles API bodies, HTTP headers, dates and malformed values', () => {
  assert.equal(retryDelayMs({ response: { data: { retryAfter: 3 } } }), 3000);
  assert.equal(retryDelayMs({ response: { headers: { 'retry-after': '60' } } }), 60000);
  assert.equal(retryDelayMs({ response: { headers: { 'retry-after': 'Tue, 29 Sep 2026 10:00:10 GMT' } } }, Date.parse('2026-09-29T10:00:00Z')), 10000);
  assert.equal(retryDelayMs({ response: { headers: { 'retry-after': '-3' } } }), 0);
  assert.equal(retryDelayMs({}), 0);
});
