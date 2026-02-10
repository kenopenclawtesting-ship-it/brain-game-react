import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

// Shape groups matching NORMAL_GROUP_INDICES = [0,1,2,3,4,6]
// Each group has items (frames) - we use sprite PNGs from extracted assets
const SHAPE_GROUPS = [
  { name: 'Shapes0', sprite: 'DefineSprite_896_Shapes0', count: 6 },
  { name: 'Shapes1', sprite: 'DefineSprite_930_Shapes1', count: 8 },
  { name: 'Shapes2', sprite: 'DefineSprite_947_Shapes2', count: 10 },
  { name: 'Shapes3', sprite: 'DefineSprite_964_Shapes3', count: 9 },
  { name: 'Shapes4', sprite: 'DefineSprite_981_Shapes4', count: 8 },
  { name: 'Shapes6', sprite: 'DefineSprite_1001_Shapes6', count: 8 },
];

function getItemSpritePath(groupIdx, itemFrame) {
  const group = SHAPE_GROUPS[groupIdx];
  return `/sprites/${group.sprite}/${itemFrame}.png`;
}

// Render a single item image
function ItemImage({ groupIdx, itemFrame, size = 52 }) {
  return (
    <img
      src={getItemSpritePath(groupIdx, itemFrame)}
      alt={`Item ${itemFrame}`}
      style={{ width: size, height: size, objectFit: 'contain', imageRendering: 'auto' }}
      draggable={false}
    />
  );
}

// Render items stacked on a pan
function PanItems({ groupIdx, itemFrames, size = 48 }) {
  if (itemFrames.length === 1) {
    return <ItemImage groupIdx={groupIdx} itemFrame={itemFrames[0]} size={size} />;
  }
  // Multiple items overlap slightly
  const overlap = Math.min(16, 48 / itemFrames.length);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' }}>
      {itemFrames.map((frame, i) => (
        <div key={i} style={{ marginLeft: i > 0 ? -overlap : 0, zIndex: i }}>
          <ItemImage groupIdx={groupIdx} itemFrame={frame} size={size} />
        </div>
      ))}
    </div>
  );
}

// Balance scale component
function Scale({ leftItems, rightItems, groupIdx, tiltDirection, compact = false }) {
  // tiltDirection: 'left' = left heavier (left lower), 'right' = right heavier, 'equal' = balanced
  const tiltAngle = tiltDirection === 'left' ? -8 : tiltDirection === 'right' ? 8 : 0;
  const w = compact ? 200 : 260;
  const beamWidth = compact ? 160 : 210;
  const fulcrumH = compact ? 20 : 26;
  const itemSize = compact ? 40 : 50;

  return (
    <div style={{
      width: w,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Tilting beam with pans and items */}
      <div style={{
        width: beamWidth,
        position: 'relative',
        transform: `rotate(${tiltAngle}deg)`,
        transformOrigin: 'center bottom',
        transition: 'transform 0.5s ease',
        paddingBottom: 4,
      }}>
        {/* Items row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '0 4px',
          minHeight: itemSize + 8,
        }}>
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', minWidth: 60 }}>
            <PanItems groupIdx={groupIdx} itemFrames={leftItems} size={itemSize} />
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', minWidth: 60 }}>
            <PanItems groupIdx={groupIdx} itemFrames={rightItems} size={itemSize} />
          </div>
        </div>

        {/* Beam bar */}
        <div style={{
          height: 5,
          background: '#1A1A1A',
          borderRadius: 2,
          margin: '0 2px',
        }} />

        {/* Pans (trapezoids) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 2px',
        }}>
          {/* Left pan */}
          <svg width="70" height="14" viewBox="0 0 70 14" style={{ display: 'block' }}>
            <path d="M8 0 L62 0 L56 14 L14 14 Z" fill="#2A2A2A" />
          </svg>
          {/* Right pan */}
          <svg width="70" height="14" viewBox="0 0 70 14" style={{ display: 'block' }}>
            <path d="M8 0 L62 0 L56 14 L14 14 Z" fill="#2A2A2A" />
          </svg>
        </div>

        {/* Vertical strings from beam to pans */}
        <div style={{
          position: 'absolute',
          left: 18,
          top: itemSize + 8,
          width: 2,
          height: 18,
          background: '#1A1A1A',
        }} />
        <div style={{
          position: 'absolute',
          right: 18,
          top: itemSize + 8,
          width: 2,
          height: 18,
          background: '#1A1A1A',
        }} />
      </div>

      {/* White pivot circle */}
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: '#fff',
        border: '2.5px solid #1A1A1A',
        position: 'relative',
        zIndex: 3,
        marginTop: -6,
      }} />

      {/* Fulcrum triangle */}
      <div style={{
        width: 0,
        height: 0,
        borderLeft: `${fulcrumH * 0.7}px solid transparent`,
        borderRight: `${fulcrumH * 0.7}px solid transparent`,
        borderBottom: `${fulcrumH}px solid #1A1A1A`,
        marginTop: -2,
      }} />
    </div>
  );
}

function WeightGame({ onAnswer, totalCorrect }) {
  const [puzzle, setPuzzle] = useState(null);
  const roundRef = useRef(0);

  const generatePuzzle = useCallback(() => {
    roundRef.current += 1;
    const round = roundRef.current;

    // Difficulty scaling per ActionScript
    const numScales = Math.min(1 + Math.floor(totalCorrect / 8), 4);
    // Extra items at higher difficulty
    const extraItems = totalCorrect >= 16 ? 1 : 0;
    const numItems = numScales + 1 + extraItems;

    // Pick a random shape group
    const groupIdx = Math.floor(Math.random() * SHAPE_GROUPS.length);
    const group = SHAPE_GROUPS[groupIdx];

    // Pick unique item frames from the group
    const allFrames = Array.from({ length: group.count }, (_, i) => i + 1);
    const shuffledFrames = allFrames.sort(() => Math.random() - 0.5);
    const selectedFrames = shuffledFrames.slice(0, Math.min(numItems, group.count));

    // Assign weights - each item gets a unique weight (unless equal trap)
    const items = selectedFrames.map((frame, i) => ({
      frame,
      weight: (selectedFrames.length - i) * 10 + Math.floor(Math.random() * 8),
    }));

    // At round 4+ (totalCorrect >= 3): may have EQUAL weight items (traps)
    if (totalCorrect >= 3 && Math.random() < 0.3) {
      // Make two items equal weight (but neither is the heaviest)
      if (items.length >= 3) {
        items[items.length - 1].weight = items[items.length - 2].weight;
      }
    }

    // Sort by weight descending - heaviest first
    items.sort((a, b) => b.weight - a.weight);
    const heaviestFrame = items[0].frame;

    // Generate scales - each scale compares items
    const scales = [];
    // At round 3+ (totalCorrect >= 2): may have multiple items per side
    const allowMultiple = totalCorrect >= 2;

    // Build scales that allow player to deduce the heaviest
    // Strategy: create comparisons that form a chain showing the heaviest
    for (let s = 0; s < numScales; s++) {
      let leftFrames, rightFrames;

      if (allowMultiple && Math.random() < 0.4 && items.length > 2) {
        // Multiple items per side (up to 3)
        const numPerSide = Math.min(2 + (Math.random() < 0.3 ? 1 : 0), 3);
        // Pick items for left and right
        const availableItems = [...items];
        leftFrames = [];
        rightFrames = [];
        let leftWeight = 0, rightWeight = 0;

        for (let i = 0; i < numPerSide && availableItems.length > 0; i++) {
          const li = Math.floor(Math.random() * availableItems.length);
          const leftItem = availableItems.splice(li, 1)[0];
          leftFrames.push(leftItem.frame);
          leftWeight += leftItem.weight;
        }
        for (let i = 0; i < numPerSide && availableItems.length > 0; i++) {
          const ri = Math.floor(Math.random() * availableItems.length);
          const rightItem = availableItems.splice(ri, 1)[0];
          rightFrames.push(rightItem.frame);
          rightWeight += rightItem.weight;
        }

        // Fallback if not enough items
        if (leftFrames.length === 0 || rightFrames.length === 0) {
          leftFrames = [items[Math.min(s, items.length - 1)].frame];
          rightFrames = [items[Math.min(s + 1, items.length - 1)].frame];
        }

        const tilt = leftWeight > rightWeight ? 'left' : leftWeight < rightWeight ? 'right' : 'equal';
        scales.push({ leftFrames, rightFrames, tilt });
      } else {
        // Simple 1v1 comparison
        const leftItem = items[Math.min(s, items.length - 1)];
        const rightItem = items[Math.min(s + 1, items.length - 1)];
        const tilt = leftItem.weight > rightItem.weight ? 'left' : leftItem.weight < rightItem.weight ? 'right' : 'equal';
        scales.push({
          leftFrames: [leftItem.frame],
          rightFrames: [rightItem.frame],
          tilt,
        });
      }
    }

    // Answer options - all unique items shuffled
    const answerFrames = [...selectedFrames].sort(() => Math.random() - 0.5);

    setPuzzle({
      groupIdx,
      scales,
      answerFrames,
      heaviestFrame,
    });
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleItemClick = (frame) => {
    if (!puzzle) return;
    const isCorrect = frame === puzzle.heaviestFrame;
    onAnswer(isCorrect);
    generatePuzzle();
  };

  if (!puzzle) return null;

  const { groupIdx, scales, answerFrames } = puzzle;
  const compact = scales.length > 2;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '16px 20px',
      gap: '12px',
    }}>
      {/* Scales display */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: compact ? '16px' : '28px',
        flex: '1 1 auto',
        alignContent: 'center',
      }}>
        {scales.map((scale, i) => (
          <Scale
            key={i}
            leftItems={scale.leftFrames}
            rightItems={scale.rightFrames}
            groupIdx={groupIdx}
            tiltDirection={scale.tilt}
            compact={compact}
          />
        ))}
      </div>

      {/* Answer buttons - OG style: white rounded squares with dark borders */}
      <div style={{
        display: 'flex',
        gap: '14px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: '16px',
        flexShrink: 0,
      }}>
        {answerFrames.map((frame) => (
          <motion.button
            key={frame}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleItemClick(frame)}
            style={{
              width: '76px',
              height: '76px',
              background: '#FAFAFA',
              border: '3px solid #2A2A2A',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              padding: 4,
            }}
          >
            <ItemImage groupIdx={groupIdx} itemFrame={frame} size={56} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default WeightGame;
