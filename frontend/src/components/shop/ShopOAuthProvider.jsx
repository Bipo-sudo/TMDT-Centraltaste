'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = '384176700530-f9n25gqvdao8gsvvf790vgvaopdoss60.apps.googleusercontent.com';

export default function ShopOAuthProvider({ children }) {
  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
}
