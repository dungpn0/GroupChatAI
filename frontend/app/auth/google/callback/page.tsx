// Google OAuth callback handler
export default function GoogleCallback() {
  // This component handles the OAuth callback
  // Extract token/code from URL and send to parent window
  
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
      window.close();
    } else if (code) {
      // In a real implementation, you would exchange code for token
      // For now, we'll just send the code
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        code: code
      }, window.location.origin);
      window.close();
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}