// Optional runtime API base URL. Loaded before the app so fetch() uses this instead of build-time default.
// Production (AWS): set to your API URL, e.g. window.__API_BASE__ = 'https://xxx.execute-api.region.amazonaws.com/api/v1';
// Leave empty to use NEXT_PUBLIC_API_URL from build (set NEXT_PUBLIC_API_URL to your AWS API URL before npm run build).
window.__API_BASE__ = '';
