export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export type OrnamentType = 'SPHERE' | 'BOX' | 'LIGHT';

export interface OrnamentConfig {
  count: number;
  type: OrnamentType;
  color: string;
  size: number;
  weight: number; // Affects floating intensity
  emissive?: boolean;
}