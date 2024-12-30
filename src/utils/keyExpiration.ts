import { clearVerifications } from './checkpointVerification';

export const isKeyExpired = (expiresAt: string): boolean => {
  try {
    const expirationDate = new Date(expiresAt);
    return expirationDate.getTime() <= Date.now();
  } catch {
    return true; // If we can't parse the date, consider it expired
  }
};

export const handleKeyExpiration = () => {
  try {
    clearVerifications();
    localStorage.removeItem('hwid');
  } catch (error) {
    console.error('Error handling key expiration:', error);
  }
};