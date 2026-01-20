interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  id: string;
}

class GoogleOAuthService {
  private clientId: string;
  private isGoogleLoaded = false;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  }

  // Load Google Identity Services
  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isGoogleLoaded && (window as any).google) {
        resolve();
        return;
      }

      if (typeof window === 'undefined') {
        reject(new Error('Google Identity Services can only be loaded in browser'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.isGoogleLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  // Initialize Google OAuth with One Tap
  async initializeGoogleOAuth(): Promise<void> {
    if (!this.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    await this.loadGoogleIdentityServices();

    return new Promise((resolve) => {
      (window as any).google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          // This callback will be handled by signInWithGoogle method
          resolve();
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      resolve();
    });
  }

  // Sign in with Google and get ID token
  async signInWithGoogle(): Promise<string> {
    if (!this.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    try {
      await this.loadGoogleIdentityServices();

      return new Promise((resolve, reject) => {
        (window as any).google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => {
            if (response.credential) {
              resolve(response.credential);
            } else {
              reject(new Error('No credential received from Google'));
            }
          },
          error_callback: (error: any) => {
            reject(new Error(`Google Identity Services error: ${JSON.stringify(error)}`));
          }
        });

        // Try One Tap first
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup if One Tap is not available
            this.showGoogleSignInPopup(resolve, reject);
          }
        });
      });
    } catch (error: any) {
      console.error('Google OAuth Error:', error);
      throw new Error(`Google authentication failed: ${error.message || error}`);
    }
  }

  // Alternative method using Google Identity Services with popup
  async signInWithGoogleIdentity(): Promise<string> {
    if (!this.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    try {
      await this.loadGoogleIdentityServices();

      return new Promise((resolve, reject) => {
        (window as any).google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => {
            if (response.credential) {
              resolve(response.credential);
            } else {
              reject(new Error('No credential received from Google'));
            }
          },
        });

        this.showGoogleSignInPopup(resolve, reject);
      });
    } catch (error: any) {
      throw new Error(`Failed to initialize Google Identity: ${error.message}`);
    }
  }

  private showGoogleSignInPopup(resolve: (token: string) => void, reject: (error: Error) => void): void {
    try {
      // Create a temporary button element for Google Sign-In
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      (window as any).google.accounts.id.renderButton(tempDiv, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
      });

      // Auto-click the button to trigger sign-in
      setTimeout(() => {
        const button = tempDiv.querySelector('[role="button"]') as HTMLElement;
        if (button) {
          button.click();
        } else {
          // Fallback: Use OAuth 2.0 popup flow
          this.openOAuthPopup(resolve, reject);
        }
        // Clean up
        document.body.removeChild(tempDiv);
      }, 100);
    } catch (error: any) {
      reject(new Error(`Failed to show Google sign-in popup: ${error.message}`));
    }
  }

  private openOAuthPopup(resolve: (token: string) => void, reject: (error: Error) => void): void {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid profile email';
    const responseType = 'code';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${responseType}&` +
      `access_type=offline&` +
      `prompt=consent`;

    const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
    
    if (!popup) {
      reject(new Error('Failed to open Google authentication popup'));
      return;
    }

    // Listen for popup to close or receive message
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error('Google authentication was cancelled'));
      }
    }, 1000);

    // Handle message from popup (if using postMessage)
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve(event.data.token);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error));
      }
    };

    window.addEventListener('message', messageHandler);
  }

  // Sign out
  async signOut(): Promise<void> {
    if (this.isGoogleLoaded && (window as any).google) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  }
}

// Create singleton instance
const googleOAuthService = new GoogleOAuthService();

export default googleOAuthService;