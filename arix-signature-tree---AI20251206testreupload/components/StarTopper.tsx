import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SCATTER_RADIUS, TREE_HEIGHT } from '../constants';

interface StarTopperProps {
  progress: number;
}

export const StarTopper: React.FC<StarTopperProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create Star Shape for Extrusion
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.5;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.sin(angle) * radius; // sin/cos swapped to point up
      const y = Math.cos(angle) * radius;
      
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Positions
  const { scatterPos, treePos } = useMemo(() => {
    // Random scatter position high up
    const r = SCATTER_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5; // Upper hemisphere
    
    const sx = r * Math.sin(phi) * Math.cos(theta);
    const sy = r * Math.cos(phi);
    const sz = r * Math.sin(phi) * Math.sin(theta);

    // Tree Position: Top of tree
    // Tree height is centered, so top is approx height/2
    const tx = 0;
    const ty = (TREE_HEIGHT / 2) + 0.5; 
    const tz = 0;

    return { 
      scatterPos: new THREE.Vector3(sx, sy, sz),
      treePos: new THREE.Vector3(tx, ty, tz)
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth animation progress
    const t = THREE.MathUtils.smoothstep(progress, 0, 1);
    
    // Position Interpolation
    meshRef.current.position.lerpVectors(scatterPos, treePos, t);

    // Rotation
    // Fast chaotic spin when scattered, slow majestic spin when tree
    const time = state.clock.getElapsedTime();
    if (progress < 0.5) {
       meshRef.current.rotation.x = time * 0.5;
       meshRef.current.rotation.y = time * 0.8;
       meshRef.current.rotation.z = time * 0.3;
    } else {
       // Snap to upright and rotate Y
       meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.05);
       meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.05);
       meshRef.current.rotation.y = time * 0.5;
    }

    // Scale Pulse
    const scale = 1.0 + 0.1 * Math.sin(time * 2);
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow>
      <meshStandardMaterial 
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={2.0}
        metalness={1.0}
        roughness={0.1}
      />
    </mesh>
  );
};