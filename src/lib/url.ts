export const getBaseUrl = () => {
  // For local development, always use localhost
  // Check if we're running in the browser on localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const port = window.location.port || '3000';
      return `http://${hostname}:${port}`;
    }
  }
  
  // For server-side or production, use environment variables
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
};

export const absUrl = (p: string) =>
  new URL(p.startsWith('/') ? p : `/${p}`, getBaseUrl()).toString();
