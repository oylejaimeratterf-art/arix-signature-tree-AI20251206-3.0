import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrnamentConfig, OrnamentType } from '../types';
import { SCATTER_RADIUS, TREE_HEIGHT, TREE_RADIUS_BASE } from '../constants';

interface OrnamentGroupProps {
  config: OrnamentConfig;
  progress: number; // 0 to 1 target
}

export const OrnamentGroup: React.FC<OrnamentGroupProps> = ({ config, progress }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Data for animation
  const data = useMemo(() => {
    const scatterPos = new Float32Array(config.count * 3);
    const treePos = new Float32Array(config.count * 3);
    const randoms = new Float32Array(config.count);
    
    const tempObj = new THREE.Object3D();

    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;
      
      // Scatter Position
      const r = SCATTER_RADIUS * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      scatterPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      scatterPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      scatterPos[i3 + 2] = r * Math.cos(phi);

      // Tree Position
      // Ornaments sit on the *surface* or slightly inside
      const h = Math.random();
      const radiusAtH = TREE_RADIUS_BASE * (1 - h);
      // Push light elements closer to core, heavy elements to outside
      const depth = config.type === 'LIGHT' ? 0.6 + Math.random() * 0.4 : 0.9 + Math.random() * 0.2;
      const finalR = radiusAtH * depth;
      const angle = Math.random() * Math.PI * 2;

      treePos[i3] = Math.cos(angle) * finalR;
      treePos[i3 + 1] = (h * TREE_HEIGHT) - (TREE_HEIGHT / 2);
      treePos[i3 + 2] = Math.sin(angle) * finalR;

      randoms[i] = Math.random();
    }
    
    return { scatterPos, treePos, randoms };
  }, [config]);

  // Ref to track current animation progress specifically for this group (allows staggering if needed)
  const currentProgress = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth Lerp for the state transition
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, progress, 0.04);
    
    const t = currentProgress.current;
    // Ease the transition
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const time = state.clock.getElapsedTime();
    const tempObj = new THREE.Object3D();

    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;
      
      // Interpolate position
      const x = THREE.MathUtils.lerp(data.scatterPos[i3], data.treePos[i3], ease);
      const y = THREE.MathUtils.lerp(data.scatterPos[i3+1], data.treePos[i3+1], ease);
      const z = THREE.MathUtils.lerp(data.scatterPos[i3+2], data.treePos[i3+2], ease);

      // Add "Float" based on weight and state
      // Less float when assembled (t=1), more when scattered (t=0)
      const floatAmp = (1.0 - ease) * (2.0 / config.weight) * 0.5; 
      const floatY = Math.sin(time * 0.5 + data.randoms[i] * 10) * floatAmp;
      
      tempObj.position.set(x, y + floatY, z);
      
      // Rotation
      // Spin when scattered, stabilize when tree
      if (config.type !== 'SPHERE') { // Spheres don't need much rotation viz
         tempObj.rotation.x = THREE.MathUtils.lerp(time * 0.2 + data.randoms[i], 0, ease);
         tempObj.rotation.y = THREE.MathUtils.lerp(time * 0.3 + data.randoms[i], data.randoms[i] * Math.PI, ease);
      } else {
         tempObj.rotation.set(0,0,0);
      }
      
      // Scale pop-in effect
      const scale = config.size * (0.8 + 0.2 * Math.sin(time + data.randoms[i] * 5));
      tempObj.scale.setScalar(scale);

      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Geometry Selection
  let Geometry = <sphereGeometry args={[1, 16, 16]} />;
  if (config.type === 'BOX') Geometry = <boxGeometry args={[1, 1, 1]} />;
  if (config.type === 'LIGHT') Geometry = <dodecahedronGeometry args={[1, 0]} />;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, config.count]}
      castShadow
      receiveShadow
    >
      {Geometry}
      <meshStandardMaterial
        color={config.color}
        emissive={config.emissive ? config.color : '#000000'}
        emissiveIntensity={config.emissive ? 4.0 : 0}
        metalness={config.type !== 'LIGHT' ? 0.9 : 0.1}
        roughness={config.type !== 'LIGHT' ? 0.1 : 0.2}
      />
    </instancedMesh>
  );
};