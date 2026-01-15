// Polyfill for 'ws' module in browser environment
// The SDK only uses ws in Node.js environment, safe to provide empty export
export default class WebSocket { };
