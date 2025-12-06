import React, { Suspense } from 'react';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Foliage } from './Foliage';
import { OrnamentGroup } from './OrnamentGroup';
import { StarTopper } from './StarTopper';
import { Ribbon } from './Ribbon';
import { TreeMorphState } from '../types';
import { ORNAMENT_CONFIGS, COLORS } from '../constants';

interface SceneProps {
  treeState: TreeMorphState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  const targetProgress = treeState === TreeMorphState.TREE_SHAPE ? 1.0 : 0.0;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={40} 
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} color={COLORS.EMERALD_DEEP} />
      <pointLight position={[10, 20, 10]} intensity={1.5} color="#fff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={COLORS.GOLD_ROSE} />
      <spotLight 
        position={[0, 30, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        color={COLORS.GOLD_METALLIC}
      />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" background={false} />

      <group position={[0, -2, 0]}>
         {/* The Foliage System */}
        <Foliage progress={targetProgress} />

        {/* The Spiral Ribbon */}
        <Ribbon progress={targetProgress} />

        {/* The Ornaments */}
        {ORNAMENT_CONFIGS.map((config, idx) => (
          <OrnamentGroup key={idx} config={config} progress={targetProgress} />
        ))}

        {/* The Star Topper */}
        <StarTopper progress={targetProgress} />
      </group>

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Bloom 
          luminanceThreshold={0.8} 
          intensity={1.5} 
          levels={9} 
          mipmapBlur 
          radius={0.7}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  );
};