import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

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

// Items sitting ON TOP of a flat platform
function PlatformItems({ groupIdx, itemFrames, size = 44 }) {
  if (itemFrames.length === 1) {
    return <ItemImage groupIdx={groupIdx} itemFrame={itemFrames[0]} size={size} />;
  }
  const overlap = Math.min(14, 40 / itemFrames.length);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      {itemFrames.map((frame, i) => (
        <div key={i} style={{ marginLeft: i > 0 ? -overlap : 0, zIndex: i }}>
          <ItemImage groupIdx={groupIdx} itemFrame={frame} size={size} />
        </div>
      ))}
    </div>
  );
}

// OG Flash-style balance scale: large black fulcrum, pivot circle, thick beam, flat trays, items ON trays
function Scale({ leftItems, rightItems, groupIdx, tiltDirection, compact = false }) {
  const tiltAngle = tiltDirection === 'left' ? -10 : tiltDirection === 'right' ? 10 : 0;

  // Dimensions scaled for compact (multi-scale) vs normal
  const s = compact ? 0.65 : 1;
  const beamWidth = Math.round(250 * s);
  const halfBeam = beamWidth / 2;
  const beamThick = Math.round(6 * s);
  const trayW = Math.round(80 * s);
  const trayH = Math.round(10 * s);
  const itemSize = Math.round(60 * s);
  const fulcrumBottomW = Math.round(50 * s);
  const fulcrumTopW = Math.round(10 * s);
  const fulcrumH = Math.round(50 * s);
  const pivotD = Math.round(12 * s);
  const pivotR = pivotD / 2;

  // Total container height: items + beam + fulcrum + margins
  const containerW = beamWidth + trayW + 20;
  const containerH = itemSize + trayH + beamThick + fulcrumH + pivotD + 10;
  // Pivot point position from top: leave room for items above beam
  const pivotTop = itemSize + trayH + beamThick / 2;

  return (
    <div style={{
      position: 'relative',
      width: containerW,
      height: containerH,
    }}>
      {/* Fulcrum - stationary, bottom center */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
      }}>
        {/* Pentagon/trapezoid shape using clip-path */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: fulcrumBottomW,
          height: fulcrumH,
          background: '#1A1A1A',
          clipPath: `polygon(${(fulcrumBottomW - fulcrumTopW) / 2}px 0, ${(fulcrumBottomW + fulcrumTopW) / 2}px 0, ${fulcrumBottomW}px ${fulcrumH}px, 0 ${fulcrumH}px)`,
        }} />
      </div>

      {/* White pivot circle - stationary, at pivot point */}
      <div style={{
        position: 'absolute',
        top: pivotTop - pivotR,
        left: '50%',
        transform: 'translateX(-50%)',
        width: pivotD,
        height: pivotD,
        borderRadius: '50%',
        background: '#fff',
        border: `${Math.round(2.5 * s)}px solid #1A1A1A`,
        zIndex: 3,
        boxSizing: 'border-box',
      }} />

      {/* Beam assembly - rotates around pivot */}
      <div style={{
        position: 'absolute',
        top: pivotTop,
        left: '50%',
        width: beamWidth,
        transform: `translateX(-50%) rotate(${tiltAngle}deg)`,
        transformOrigin: 'center top',
        transition: 'transform 0.5s ease',
        zIndex: 2,
      }}>
        {/* Horizontal beam */}
        <div style={{
          position: 'absolute',
          top: -beamThick / 2,
          left: 0,
          width: beamWidth,
          height: beamThick,
          background: '#1A1A1A',
          borderRadius: beamThick / 2,
        }} />

        {/* Left tray + items */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: -trayW / 2,
          width: trayW,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Items sitting on top of tray */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            minHeight: itemSize,
            transform: `translateY(-${trayH + beamThick / 2}px)`,
          }}>
            <PlatformItems groupIdx={groupIdx} itemFrames={leftItems} size={itemSize} />
          </div>
          {/* Flat tray */}
          <div style={{
            width: trayW,
            height: trayH,
            background: 'linear-gradient(to bottom, #444, #1A1A1A)',
            borderRadius: 1,
            transform: `translateY(-${trayH + beamThick / 2}px)`,
          }} />
        </div>

        {/* Right tray + items */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: -trayW / 2,
          width: trayW,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Items sitting on top of tray */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            minHeight: itemSize,
            transform: `translateY(-${trayH + beamThick / 2}px)`,
          }}>
            <PlatformItems groupIdx={groupIdx} itemFrames={rightItems} size={itemSize} />
          </div>
          {/* Flat tray */}
          <div style={{
            width: trayW,
            height: trayH,
            background: 'linear-gradient(to bottom, #444, #1A1A1A)',
            borderRadius: 1,
            transform: `translateY(-${trayH + beamThick / 2}px)`,
          }} />
        </div>
      </div>
    </div>
  );
}

// Background spiral SVG
function SpiralBackground() {
  // Generate spiral arcs radiating from center
  const paths = [];
  const cx = 320, cy = 240;
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const r1 = 60, r2 = 180, r3 = 320;
    // Curved swoosh lines
    const cp1x = cx + Math.cos(angle + 0.3) * r1;
    const cp1y = cy + Math.sin(angle + 0.3) * r1;
    const cp2x = cx + Math.cos(angle + 0.15) * r2;
    const cp2y = cy + Math.sin(angle + 0.15) * r2;
    const ex = cx + Math.cos(angle) * r3;
    const ey = cy + Math.sin(angle) * r3;
    paths.push(
      <path
        key={i}
        d={`M ${cx} ${cy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`}
        fill="none"
        stroke="#fff"
        strokeWidth={18}
        strokeLinecap="round"
        opacity={0.1}
      />
    );
  }
  return (
    <svg
      width="640" height="480"
      viewBox="0 0 640 480"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {paths}
    </svg>
  );
}

function WeightGame({ onAnswer, totalCorrect }) {
  const [puzzle, setPuzzle] = useState(null);
  const roundRef = useRef(0);

  const generatePuzzle = useCallback(() => {
    roundRef.current += 1;

    const numScales = Math.min(1 + Math.floor(totalCorrect / 8), 4);
    const extraItems = totalCorrect >= 16 ? 1 : 0;
    const numItems = numScales + 1 + extraItems;

    const groupIdx = Math.floor(Math.random() * SHAPE_GROUPS.length);
    const group = SHAPE_GROUPS[groupIdx];

    const allFrames = Array.from({ length: group.count }, (_, i) => i + 1);
    const shuffledFrames = allFrames.sort(() => Math.random() - 0.5);
    const selectedFrames = shuffledFrames.slice(0, Math.min(numItems, group.count));

    const items = selectedFrames.map((frame, i) => ({
      frame,
      weight: (selectedFrames.length - i) * 10 + Math.floor(Math.random() * 8),
    }));

    if (totalCorrect >= 3 && Math.random() < 0.3) {
      if (items.length >= 3) {
        items[items.length - 1].weight = items[items.length - 2].weight;
      }
    }

    items.sort((a, b) => b.weight - a.weight);
    const heaviestFrame = items[0].frame;

    const scales = [];
    const allowMultiple = totalCorrect >= 2;

    for (let s = 0; s < numScales; s++) {
      let leftFrames, rightFrames;

      if (allowMultiple && Math.random() < 0.4 && items.length > 2) {
        const numPerSide = Math.min(2 + (Math.random() < 0.3 ? 1 : 0), 3);
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

        if (leftFrames.length === 0 || rightFrames.length === 0) {
          leftFrames = [items[Math.min(s, items.length - 1)].frame];
          rightFrames = [items[Math.min(s + 1, items.length - 1)].frame];
        }

        const tilt = leftWeight > rightWeight ? 'left' : leftWeight < rightWeight ? 'right' : 'equal';
        scales.push({ leftFrames, rightFrames, tilt });
      } else {
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

    const answerFrames = [...selectedFrames].sort(() => Math.random() - 0.5);

    setPuzzle({ groupIdx, scales, answerFrames, heaviestFrame });
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

  // Layout: for 3 scales, 2 on top + 1 on bottom with connecting lines
  const isThreeScale = scales.length === 3;
  const isTwoScale = scales.length === 2;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Background spiral */}
      <SpiralBackground />

      {/* Scales area */}
      <div style={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isThreeScale ? 8 : 16,
        position: 'relative',
        zIndex: 1,
      }}>
        {isThreeScale ? (
          <>
            {/* Top row: 2 scales */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'flex-end' }}>
              <Scale leftItems={scales[0].leftFrames} rightItems={scales[0].rightFrames} groupIdx={groupIdx} tiltDirection={scales[0].tilt} compact />
              <Scale leftItems={scales[1].leftFrames} rightItems={scales[1].rightFrames} groupIdx={groupIdx} tiltDirection={scales[1].tilt} compact />
            </div>
            {/* Connecting lines */}
            <svg width="300" height="20" style={{ display: 'block' }}>
              <line x1="75" y1="0" x2="150" y2="20" stroke="#1A1A1A" strokeWidth={3} />
              <line x1="225" y1="0" x2="150" y2="20" stroke="#1A1A1A" strokeWidth={3} />
            </svg>
            {/* Bottom: 1 scale */}
            <Scale leftItems={scales[2].leftFrames} rightItems={scales[2].rightFrames} groupIdx={groupIdx} tiltDirection={scales[2].tilt} compact />
          </>
        ) : (
          <div style={{
            display: 'flex',
            gap: isTwoScale ? 20 : 0,
            justifyContent: 'center',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
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
        )}
      </div>

      {/* Answer buttons row at bottom */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        padding: '12px 16px 16px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        {answerFrames.map((frame) => (
          <motion.button
            key={frame}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleItemClick(frame)}
            style={{
              width: 80,
              height: 80,
              background: '#FAFAFA',
              border: '3px solid #2A2A2A',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
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
