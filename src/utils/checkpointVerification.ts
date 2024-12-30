import { CHECKPOINT_LINKS } from './linkConfig';

export interface CheckpointVerificationResult {
  success: boolean;
  timestamp: number;
}

const VERIFICATION_STORAGE_KEY = 'checkpoint_verifications';
const VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const getVerifications = (): Record<string, CheckpointVerificationResult> => {
  try {
    const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
    if (!stored) return {};
    
    const verifications = JSON.parse(stored);
    const now = Date.now();
    
    // Clean expired verifications
    const cleaned = Object.entries(verifications).reduce((acc, [key, value]) => {
      if (now - (value as CheckpointVerificationResult).timestamp <= VERIFICATION_EXPIRY) {
        acc[key] = value as CheckpointVerificationResult;
      }
      return acc;
    }, {} as Record<string, CheckpointVerificationResult>);
    
    localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(cleaned));
    return cleaned;
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

export const saveVerification = (checkpoint: number): void => {
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
    return verification.success && 
           (Date.now() - verification.timestamp <= VERIFICATION_EXPIRY);
  } catch {
    return false;
  }
};