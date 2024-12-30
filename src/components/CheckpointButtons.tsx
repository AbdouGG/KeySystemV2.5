import React from 'react';
import { getCurrentCheckpoint } from '../utils/checkpointProgress';
import { createLinkvertiseUrl } from '../utils/linkvertiseHandler';
import { ExternalLink } from 'lucide-react';

interface CheckpointButtonsProps {
  checkpoints: {
    checkpoint1: boolean;
    checkpoint2: boolean;
    checkpoint3: boolean;
  };
}

export const CheckpointButtons: React.FC<CheckpointButtonsProps> = ({
  checkpoints,
}) => {
  const currentCheckpoint = getCurrentCheckpoint(checkpoints);

  const handleLinkvertise = () => {
    if (!currentCheckpoint) return;
    const linkUrl = createLinkvertiseUrl(currentCheckpoint);
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleLinkvertise}
        disabled={!currentCheckpoint}
        className="w-full bg-[#ff8c00] hover:bg-[#ff7c00] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>Continue with Linkvertise</span>
        <ExternalLink className="w-4 h-4" />
      </button>
      <button 
        className="w-full bg-[#9146ff] hover:bg-[#8134ff] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <span>Continue with Lootlabs</span>
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
};