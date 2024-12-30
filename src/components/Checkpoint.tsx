import React from 'react';
import { KeyRound, ArrowRight, Lock, Check } from 'lucide-react';
import { createLinkvertiseUrl } from '../utils/linkvertiseHandler';

interface CheckpointProps {
  number: number;
  completed: boolean;
  onComplete: () => void;
  disabled: boolean;
}

export const Checkpoint: React.FC<CheckpointProps> = ({
  number,
  completed,
  onComplete,
  disabled,
}) => {
  const handleClick = () => {
    if (completed) {
      console.log(`Checkpoint ${number} already completed`);
      return;
    }

    if (!disabled) {
      console.log(`Opening linkvertise for checkpoint ${number}`);
      const linkUrl = createLinkvertiseUrl(number);
      window.open(linkUrl, '_blank');
      // Remove automatic completion
      // onComplete will be called only after successful verification
    } else {
      console.log(`Checkpoint ${number} is disabled`);
    }
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md mb-4 transition-all
        ${
          completed
            ? 'bg-green-100'
            : disabled
            ? 'bg-gray-100 cursor-not-allowed'
            : 'bg-white hover:bg-gray-50 cursor-pointer'
        }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-full ${
              completed
                ? 'bg-green-500'
                : disabled
                ? 'bg-gray-400'
                : 'bg-blue-500'
            }`}
          >
            {completed ? (
              <Check className="w-6 h-6 text-white" />
            ) : disabled ? (
              <Lock className="w-6 h-6 text-white" />
            ) : (
              <KeyRound className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Checkpoint {number}</h3>
            <p className="text-gray-600">
              {completed
                ? 'Completed'
                : disabled
                ? 'Complete previous checkpoints first'
                : 'Click to verify'}
            </p>
          </div>
        </div>
        <ArrowRight
          className={`w-6 h-6 ${
            completed
              ? 'text-green-500'
              : disabled
              ? 'text-gray-400'
              : 'text-gray-400'
          }`}
        />
      </div>
    </div>
  );
};
