import { CHECKPOINT_LINKS } from './linkConfig';

const VERIFICATION_STORAGE_KEY = 'checkpoint_verifications';

export interface CheckpointVerificationResult {
  success: boolean;
  timestamp: number;
}

export const getVerifications = (): Record<string, CheckpointVerificationResult> => {
  try {
    const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const clearVerifications = () => {
  try {
    localStorage.removeItem(VERIFICATION_STORAGE_KEY);
  } catch {
    console.error('Failed to clear verifications');
  }
};

export const saveVerification = (checkpoint: number) => {
  try {
    const verifications = getVerifications();
    verifications[`checkpoint${checkpoint}`] = {
      success: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
  } catch {
    console.error('Failed to save verification');
  }
};

export const isCheckpointVerified = (checkpoint: number): boolean => {
  try {
    const verifications = getVerifications();
    const verification = verifications[`checkpoint${checkpoint}`];

    if (!verification) return false;

    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
    const hasExpired = Date.now() - verification.timestamp > expirationTime;

    return verification.success && !hasExpired;
  } catch {
    return false;
  }
};