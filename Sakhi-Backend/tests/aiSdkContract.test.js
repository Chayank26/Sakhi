import test from 'node:test';
import assert from 'node:assert/strict';
import { callCloudLlm } from '../ai/llm.js';

test('installed Gemini SDK serializes the tool round trip without network access', async (t) => {
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (input, init) => {
        const request = input instanceof Request ? input : new Request(input, init);
        const payload = JSON.parse(await request.text());
        requests.push(payload);
        const body = requests.length === 1
            ? { id: 'interaction-1', status: 'requires_action', steps: [{ type: 'function_call', id: 'call-1', name: 'searchJobs', arguments: { keyword: 'React' } }] }
            : { id: 'interaction-2', status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: 'A verified job' }] }] };
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
    const result = await callCloudLlm({ prompt: 'Find React jobs', systemInstruction: 'Use real records' }, {
        apiKey: 'test-key', policy: { timeoutMs: 1000, maxRetries: 0 },
        dispatch: async () => ({ success: true, jobs: [{ jobId: 'real', title: 'React developer' }] })
    });
    assert.equal(result.text, 'A verified job');
    assert.equal(requests.length, 2);
    assert.equal(requests[0].tools[0].parameters.type, 'object');
    assert.equal(requests[1].previous_interaction_id, 'interaction-1');
    assert.equal(requests[1].input[0].call_id, 'call-1');
    assert.equal(requests[1].input[0].type, 'function_result');
});

test('installed SDK quota errors are not retried and preserve Retry-After', async (t) => {
    let attempts = 0;
    t.mock.method(globalThis, 'fetch', async () => {
        attempts++;
        return new Response(JSON.stringify({ error: { code: 429, message: 'Quota exceeded', status: 'RESOURCE_EXHAUSTED' } }), {
            status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '17' }
        });
    });
    await assert.rejects(callCloudLlm({ prompt: 'Hello' }, {
        apiKey: 'test-key', policy: { timeoutMs: 1000, maxRetries: 2 }
    }), (error) => {
        assert.equal(error.statusCode, 429);
        assert.equal(error.retryAfter, 17);
        return true;
    });
    assert.equal(attempts, 1);
});
