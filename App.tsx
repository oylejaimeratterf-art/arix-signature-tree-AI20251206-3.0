import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { Controls } from './components/Controls';
import { TreeMorphState } from './types';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeMorphState.SCATTERED 
        ? TreeMorphState.TREE_SHAPE 
        : TreeMorphState.SCATTERED
    );
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: false,
          toneMappingExposure: 1.2
        }}
      >
        <color attach="background" args={[COLORS.BG]} />
        <fog attach="fog" args={[COLORS.BG, 10, 60]} />
        <Scene treeState={treeState} />
      </Canvas>
      
      <Controls currentState={treeState} onToggle={toggleState} />
    </div>
  );
};

export default App;