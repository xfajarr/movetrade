
import React from 'react';
import { useGameStore } from '../features/game/store/gameStore';
import { Direction } from '../types';

interface PredictionButtonsProps {
  verticalMode?: boolean;
}

export const PredictionButtons: React.FC<PredictionButtonsProps> = ({ verticalMode = false }) => {
  const placeBet = useGameStore((state) => state.placeBet);

  // No longer checking activeBet, betting is always open unless balance is low (handled in store)
  const activeBets = useGameStore((state) => state.activeBets);

  const handleBet = (dir: Direction) => {
    placeBet(dir);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  if (verticalMode) {
    return (
      <div className="flex gap-2.5 w-full">
        <button
          onClick={() => handleBet(Direction.UP)}
          className={`
            flex-1 h-14 rounded-xl relative overflow-hidden transition-all duration-200
            flex items-center justify-center gap-2 group
            border-b-[3px] shadow-[0_4px_0_rgb(0,204,125)] active:shadow-none active:translate-y-[3px] active:border-b-0
            hover:brightness-110 cursor-pointer bg-game-up border-[#00cc7d]
          `}
        >
          <span className="font-black text-game-dark uppercase tracking-wider text-lg relative z-10">LONG</span>
        </button>

        <button
          onClick={() => handleBet(Direction.DOWN)}
          className={`
            flex-1 h-14 rounded-xl relative overflow-hidden transition-all duration-200
            flex items-center justify-center gap-2 group
            border-b-[3px] shadow-[0_4px_0_rgb(204,0,68)] active:shadow-none active:translate-y-[3px] active:border-b-0
            hover:brightness-110 cursor-pointer bg-game-down border-[#cc0044]
          `}
        >
          <span className="font-black text-white uppercase tracking-wider text-lg relative z-10">SHORT</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 w-full max-w-4xl mx-auto h-full items-end justify-center px-4 lg:px-0">
      
      {/* UP BUTTON */}
      <button
        onClick={() => handleBet(Direction.UP)}
        className={`
          flex-1 h-14 sm:h-20 max-w-[200px] relative transition-all duration-200 group
          transform -skew-x-12 hover:-skew-x-[15deg] hover:scale-105 active:scale-95
          bg-[#00cc7d] hover:bg-[#00e68d] hover:shadow-[0_0_30px_rgba(0,204,125,0.6)]
          border-b-4 border-green-800 active:border-b-0 active:translate-y-1
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center skew-x-12">
            <div className="flex flex-col items-center leading-none">
                <span className="font-black text-black text-xl sm:text-2xl uppercase tracking-tighter">UP</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-green-900 bg-white/20 px-1 rounded">LONG</span>
            </div>
            {/* Speed Lines Overlay */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)] mix-blend-overlay opacity-30" />
        </div>
      </button>

      {/* DOWN BUTTON */}
      <button
        onClick={() => handleBet(Direction.DOWN)}
        className={`
          flex-1 h-14 sm:h-20 max-w-[200px] relative transition-all duration-200 group
          transform skew-x-12 hover:skew-x-[15deg] hover:scale-105 active:scale-95
          bg-[#cc0044] hover:bg-[#e6004d] hover:shadow-[0_0_30px_rgba(204,0,68,0.6)]
          border-b-4 border-[rgb(120,0,40)] active:border-b-0 active:translate-y-1
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center -skew-x-12">
            <div className="flex flex-col items-center leading-none">
                <span className="font-black text-white text-xl sm:text-2xl uppercase tracking-tighter">DOWN</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-red-200 bg-black/20 px-1 rounded">SHORT</span>
            </div>
             {/* Speed Lines Overlay */}
             <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)] mix-blend-overlay opacity-30" />
        </div>
      </button>

    </div>
  );
};
