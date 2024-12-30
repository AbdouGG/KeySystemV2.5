import type { CheckpointStatus } from '../types';

export const resetCheckpoints = (): CheckpointStatus => ({
  checkpoint1: false,
  checkpoint2: false,
  checkpoint3: false,
});

export const isCheckpointComplete = (
  checkpoints: CheckpointStatus,
  checkpointNumber: number
): boolean => {
  const key = `checkpoint${checkpointNumber}` as keyof CheckpointStatus;
  return checkpoints[key];
};

export const canAccessCheckpoint = (
  checkpoints: CheckpointStatus,
  checkpointNumber: number
): boolean => {
  if (checkpointNumber === 1) return true;
  return isCheckpointComplete(checkpoints, checkpointNumber - 1);
};