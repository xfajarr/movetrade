
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Direction } from '../../../types';

export const PredictionButtons: React.FC = () => {
    const placeBet = useGameStore((state) => state.placeBet);

    // No longer checking activeBet, betting is always open unless balance is low (handled in store)
    const activeBets = useGameStore((state) => state.activeBets);

    const handleBet = (dir: Direction) => {
        placeBet(dir);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    return (
        <div className="flex gap-4 w-full max-w-md mx-auto px-4 h-full pb-6 items-end">

            {/* UP BUTTON */}
            <button
                onClick={() => handleBet(Direction.UP)}
                className={`
          flex-1 h-32 rounded-3xl relative overflow-hidden transition-all duration-200
          flex flex-col items-center justify-center group
          border-b-8 shadow-[0_10px_0_rgb(0,204,125)] active:shadow-none active:translate-y-[10px] active:border-b-0
          hover:scale-[1.02] cursor-pointer bg-game-up border-[#00cc7d]
        `}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

                {/* Modern Trend Up Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 mb-1 relative z-10 drop-shadow-md text-game-dark transition-transform duration-300 group-hover:-translate-y-1"
                >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                </svg>

                <span className="font-black text-game-dark uppercase tracking-wider text-2xl relative z-10">UP</span>
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-[-100%] transition-transform duration-500" />
            </button>

            {/* DOWN BUTTON */}
            <button
                onClick={() => handleBet(Direction.DOWN)}
                className={`
          flex-1 h-32 rounded-3xl relative overflow-hidden transition-all duration-200
          flex flex-col items-center justify-center group
          border-b-8 shadow-[0_10px_0_rgb(204,0,68)] active:shadow-none active:translate-y-[10px] active:border-b-0
          hover:scale-[1.02] cursor-pointer bg-game-down border-[#cc0044]
        `}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

                {/* Modern Trend Down Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 mb-1 relative z-10 drop-shadow-md text-white transition-transform duration-300 group-hover:translate-y-1"
                >
                    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                    <polyline points="16 17 22 17 22 11"></polyline>
                </svg>

                <span className="font-black text-white uppercase tracking-wider text-2xl relative z-10">DOWN</span>
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-[-100%] transition-transform duration-500" />
            </button>
        </div>
    );
};
