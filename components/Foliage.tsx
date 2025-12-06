import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FOLIAGE_COUNT, SCATTER_RADIUS, TREE_HEIGHT, TREE_RADIUS_BASE, COLORS } from '../constants';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0.0 (Scattered) -> 1.0 (Tree)
  
  attribute vec3 aPositionScatter;
  attribute vec3 aPositionTree;
  attribute float aRandom;
  
  varying float vAlpha;
  varying vec3 vColor;

  // Quintic easing for smoother transition
  float easeInOutQuint(float x) {
    return x < 0.5 ? 16.0 * x * x * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 5.0) / 2.0;
  }

  void main() {
    float t = easeInOutQuint(uProgress);
    
    // Mix positions
    vec3 pos = mix(aPositionScatter, aPositionTree, t);
    
    // Breathing/Floating effect
    // We add sine wave motion based on randomness and time
    // Effect is stronger when scattered, tighter when in tree form
    float floatScale = mix(1.0, 0.1, t); 
    pos.x += sin(uTime * 0.5 + aRandom * 10.0) * 0.2 * floatScale;
    pos.y += cos(uTime * 0.3 + aRandom * 20.0) * 0.2 * floatScale;
    pos.z += sin(uTime * 0.4 + aRandom * 30.0) * 0.2 * floatScale;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (40.0 * (1.0 + aRandom * 0.5)) / -mvPosition.z;
    
    // Pass to fragment
    vAlpha = 0.6 + 0.4 * sin(uTime + aRandom * 10.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorLight;

  varying float vAlpha;

  void main() {
    // Circular particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Gradient from center (light) to edge (deep)
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 1.5);

    vec3 finalColor = mix(uColorDeep, uColorLight, strength);
    
    // Add a golden rim glow
    if (dist > 0.35 && dist < 0.5) {
       finalColor = mix(finalColor, vec3(1.0, 0.8, 0.2), 0.3);
    }

    gl_FragColor = vec4(finalColor, vAlpha * strength);
  }
`;

interface FoliageProps {
  progress: number;
}

export const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positionsTree, positionsScatter, randoms } = useMemo(() => {
    const pTree = new Float32Array(FOLIAGE_COUNT * 3);
    const pScatter = new Float32Array(FOLIAGE_COUNT * 3);
    const rands = new Float32Array(FOLIAGE_COUNT);

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const i3 = i * 3;

      // 1. Scatter Position (Sphere)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * SCATTER_RADIUS;
      
      pScatter[i3] = r * Math.sin(phi) * Math.cos(theta);
      pScatter[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pScatter[i3 + 2] = r * Math.cos(phi);

      // 2. Tree Position (Cone)
      // Normalized height 0 to 1
      const h = Math.random(); 
      // Current radius at height h (tapering to top)
      const currentR = TREE_RADIUS_BASE * (1 - h);
      const angle = Math.random() * Math.PI * 2;
      // Add thickness to the tree volume
      const radiusVol = currentR * Math.sqrt(Math.random());
      
      pTree[i3] = Math.cos(angle) * radiusVol;
      pTree[i3 + 1] = (h * TREE_HEIGHT) - (TREE_HEIGHT / 2); // Center Y
      pTree[i3 + 2] = Math.sin(angle) * radiusVol;

      // 3. Randoms
      rands[i] = Math.random();
    }

    return {
      positionsTree: pTree,
      positionsScatter: pScatter,
      randoms: rands
    };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // Smoothly interpolate the uniform value towards the prop
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        progress,
        0.05
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-aPositionScatter"
          count={FOLIAGE_COUNT}
          array={positionsScatter}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPositionTree"
          count={FOLIAGE_COUNT}
          array={positionsTree}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={FOLIAGE_COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uColorDeep: { value: COLORS.EMERALD_DEEP },
          uColorLight: { value: COLORS.EMERALD_LIGHT },
        }}
      />
    </points>
  );
};