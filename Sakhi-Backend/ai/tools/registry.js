import { searchJobsToolHandler } from './jobTool.js';
import { searchCoursesToolHandler } from './courseTool.js';

/**
 * Sakhi AI Tool Execution Registry & Dispatcher Module
 * Handles dispatching tool calls invoked by Gemini agent.
 */

const searchGovernmentSchemesHandler = async (args) => {
    return {
        status: 'tool_executed',
        tool: 'searchGovernmentSchemes',
        message: 'Sakhi Government Schemes tool dispatcher active. MongoDB query integration will be attached in Phase 9.',
        parametersReceived: args
    };
};

export const TOOL_REGISTRY = {
    searchJobs: searchJobsToolHandler,
    searchCourses: searchCoursesToolHandler,
    searchGovernmentSchemes: searchGovernmentSchemesHandler
};

/**
 * Dispatch tool call to appropriate handler in tool registry
 * @param {string} name - Name of the tool to execute
 * @param {Object} args - Arguments passed by Gemini
 * @returns {Promise<Object>} Structured tool execution result
 */
export const dispatchToolCall = async (name, args = {}) => {
    const handler = TOOL_REGISTRY[name];
    if (!handler) {
        throw new Error(`Tool "${name}" is not registered in Sakhi AI Tool Registry.`);
    }

    console.log(`[Sakhi AI Tool Dispatcher]: Executing tool "${name}" with parameters:`, args);
    return await handler(args);
};
