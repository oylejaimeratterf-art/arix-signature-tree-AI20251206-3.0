import React from 'react';
import { TreeMorphState } from '../types';

interface ControlsProps {
  currentState: TreeMorphState;
  onToggle: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ currentState, onToggle }) => {
  const isTree = currentState === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      
      {/* Title Section: Top Left */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 text-white/80 font-light tracking-[0.2em] uppercase text-xs pointer-events-auto">
        <h1 className="text-lg md:text-xl font-serif text-[#FFD700] mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Arix Signature
        </h1>
        <p className="opacity-90 drop-shadow-md tracking-widest text-[0.65rem] md:text-xs">
          Interactive Christmas Tree
        </p>
      </div>

      {/* Button Section: Bottom Center */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center">
        <div className="bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-2xl pointer-events-auto transition-transform duration-300 hover:scale-105">
          <button
            onClick={onToggle}
            className={`
              relative px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-500 overflow-hidden group
              ${isTree ? 'text-black bg-[#FFD700]' : 'text-[#FFD700] bg-transparent border border-[#FFD700]'}
            `}
          >
            <span className="relative z-10">
              {isTree ? 'Release Magic' : 'Assemble Tree'}
            </span>
            {/* Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
          </button>
        </div>
      </div>

    </div>
  );
};