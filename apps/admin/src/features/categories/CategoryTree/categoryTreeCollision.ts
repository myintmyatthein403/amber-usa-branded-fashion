import {
  pointerWithin,
  closestCenter,
  type CollisionDetection,
} from '@dnd-kit/core';

/** Prefer nest droppables, then root zone, then sibling sortable reorder. */
export const categoryTreeCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);

  if (pointerHits.length > 0) {
    const nestHit = pointerHits.find((c) => String(c.id).startsWith('nest-'));
    if (nestHit) return [nestHit];

    const rootHit = pointerHits.find((c) => c.id === 'root-drop');
    if (rootHit) return [rootHit];
  }

  return closestCenter(args);
};
