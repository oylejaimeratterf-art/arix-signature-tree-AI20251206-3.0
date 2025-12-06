import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_HEIGHT, TREE_RADIUS_BASE, PALETTE, SCATTER_RADIUS } from '../constants';

interface RibbonProps {
  progress: number;
}

export const Ribbon: React.FC<RibbonProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.Shader>(null);

  // Generate the Flat Ribbon Geometry
  const geometry = useMemo(() => {
    const pointsCount = 400; // Resolution
    const width = 0.6; // Ribbon width
    const turns = 6.5;
    const height = TREE_HEIGHT;
    const radiusBase = TREE_RADIUS_BASE + 1.5; // Distance from tree
    
    // Arrays for BufferGeometry
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const angle = t * turns * Math.PI * 2;
      const r = radiusBase * (1 - t);
      
      // Center position of the ribbon at this step
      const cx = Math.cos(angle) * r;
      const cy = (t * height) - (height / 2);
      const cz = Math.sin(angle) * r;
      const center = new THREE.Vector3(cx, cy, cz);

      // Calculate orientation
      // 1. Normal of the tree surface (approx horizontal from center)
      const treeNormal = new THREE.Vector3(cx, 0, cz).normalize(); 
      
      // 2. Tangent of the path
      // Calculate next point to estimate tangent
      const tNext = t + 0.001;
      const rNext = radiusBase * (1 - tNext);
      const angleNext = tNext * turns * Math.PI * 2;
      const nextCx = Math.cos(angleNext) * rNext;
      const nextCy = (tNext * height) - (height / 2);
      const nextCz = Math.sin(angleNext) * rNext;
      const nextPos = new THREE.Vector3(nextCx, nextCy, nextCz);
      
      const tangent = new THREE.Vector3().subVectors(nextPos, center).normalize();

      // 3. Binormal (Perpendicular to path and surface normal) -> Direction of ribbon width
      // This ensures the ribbon lies flat "on" the tree surface
      const binormal = new THREE.Vector3().crossVectors(tangent, treeNormal).normalize();

      // Create two vertices for the strip width
      const v1 = new THREE.Vector3().copy(center).addScaledVector(binormal, width * 0.5);
      const v2 = new THREE.Vector3().copy(center).addScaledVector(binormal, -width * 0.5);

      positions.push(v1.x, v1.y, v1.z);
      positions.push(v2.x, v2.y, v2.z);

      // Normals: both point outward (treeNormal)
      normals.push(treeNormal.x, treeNormal.y, treeNormal.z);
      normals.push(treeNormal.x, treeNormal.y, treeNormal.z);

      // UVs
      uvs.push(t, 0);
      uvs.push(t, 1);

      // Indices
      if (i < pointsCount) {
        const base = i * 2;
        // Two triangles per segment
        // 0, 1, 2
        indices.push(base, base + 1, base + 2);
        // 1, 3, 2
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    
    return geo;
  }, []);

  // Animation Loop
  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // Smoothly interpolate progress uniform
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        progress,
        0.05
      );
    }
  });

  const onBeforeCompile = (shader: THREE.Shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uProgress = { value: 0 };
    shaderRef.current = shader;

    // Inject Uniforms
    shader.vertexShader = `
      uniform float uTime;
      uniform float uProgress;
      ${shader.vertexShader}
    `;

    // Inject Position Transformation
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      vec3 transformed = position;

      // --- SCATTER LOGIC ---
      
      // 1. Explode outwards based on height
      vec3 direction = normalize(vec3(position.x, position.y * 0.5, position.z));
      vec3 scatterPos = direction * ${SCATTER_RADIUS.toFixed(1)};

      // 2. Add Wavy Noise
      float noiseFreq = 0.5;
      scatterPos.x += sin(position.y * noiseFreq + uTime) * 5.0;
      scatterPos.y += cos(position.x * noiseFreq + uTime * 0.8) * 5.0;
      scatterPos.z += sin(position.x * noiseFreq + uTime * 1.2) * 5.0;

      // 3. Twist rotation for dynamic feel
      float angle = sin(uTime * 0.2) + position.y * 0.1;
      float s = sin(angle);
      float c = cos(angle);
      mat2 rot = mat2(c, -s, s, c);
      scatterPos.xz = rot * scatterPos.xz;

      // --- MIX ---
      float t = uProgress;
      // Cubic ease out/in
      t = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;

      transformed = mix(scatterPos, transformed, t);
      `
    );
  };

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={PALETTE.RED_LUXURY}
        roughness={0.6}
        metalness={0.2}
        side={THREE.DoubleSide}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
};