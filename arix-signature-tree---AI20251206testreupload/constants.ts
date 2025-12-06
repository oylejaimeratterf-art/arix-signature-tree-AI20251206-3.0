import { OrnamentConfig } from './types';
import * as THREE from 'three';

export const COLORS = {
  EMERALD_DEEP: new THREE.Color('#002816'),
  EMERALD_LIGHT: new THREE.Color('#006B3C'),
  GOLD_METALLIC: new THREE.Color('#FFD700'),
  GOLD_ROSE: new THREE.Color('#E0BFB8'),
  GLOW_WARM: new THREE.Color('#FFF5CC'),
  BG: '#020202',
};

// New String Colors for Configs
export const PALETTE = {
  GOLD: '#FFD700',
  RED_LUXURY: '#D00014', // Deep Vivid Red
  GREEN_GEM: '#006B3C',   // Emerald Green
  WHITE_WARM: '#FFF8E7',
};

// Tree Dimensions
export const TREE_HEIGHT = 16;
export const TREE_RADIUS_BASE = 5.2; // Reduced from 6.0 to create a more compact, tighter cone
export const SCATTER_RADIUS = 35;

// Particle Counts
export const FOLIAGE_COUNT = 15000;

export const ORNAMENT_CONFIGS: OrnamentConfig[] = [
  // --- BOXES (Gift Boxes) ---
  // Requirement: Volume consistent with Spheres. 
  // Box Side 0.5 -> Vol 0.125
  // Quantity: Increased significantly (150 per color) for high density
  {
    type: 'BOX',
    count: 150,
    color: PALETTE.GOLD,
    size: 0.5,
    weight: 1.0, 
  },
  {
    type: 'BOX',
    count: 150,
    color: PALETTE.RED_LUXURY,
    size: 0.5,
    weight: 1.0, 
  },
  {
    type: 'BOX',
    count: 150,
    color: PALETTE.GREEN_GEM,
    size: 0.5,
    weight: 1.0, 
  },

  // --- SPHERES (Baubles) ---
  // Requirement: Volume consistent with Boxes.
  // Sphere Radius 0.31 -> Vol ~0.125 (4/3 * pi * 0.31^3)
  // Quantity: Equal to Boxes (150 per color)
  {
    type: 'SPHERE',
    count: 150,
    color: PALETTE.GOLD,
    size: 0.31,
    weight: 0.5,
  },
  {
    type: 'SPHERE',
    count: 150,
    color: PALETTE.RED_LUXURY,
    size: 0.31,
    weight: 0.5,
  },
  {
    type: 'SPHERE',
    count: 150,
    color: PALETTE.GREEN_GEM,
    size: 0.31,
    weight: 0.5,
  },

  // --- LIGHTS ---
  // Increased to maintain balance with denser ornaments
  {
    type: 'LIGHT',
    count: 800,
    color: PALETTE.WHITE_WARM,
    size: 0.15,
    weight: 0.1, 
    emissive: true,
  }
];