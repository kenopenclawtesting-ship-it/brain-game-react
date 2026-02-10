import React, { useState, useEffect, useCallback, useRef } from 'react';

// MeteorSequence - Click floating meteors in ascending order
// Original sprites: 5 meteor types (Meteor1-5) with different colors
// Pink, Green, Yellow, Blue, Grey

const METEOR_SPRITES = [
  '/sprites/DefineSprite_597_Meteor1/1.png',  // Pink
  '/sprites/DefineSprite_593_Meteor2/1.png',  // Green
  '/sprites/DefineSprite_589_Meteor3/1.png',  // Yellow
  '/sprites/DefineSprite_608_Meteor4/1.png',  // Blue
  '/sprites/DefineSprite_603_Meteor5/1.png',  // Grey
];

const NUMBER_WORDS = [
  'ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE',
  'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
];

const GAME_W = 640;
const GAME_H = 400;
const METEOR_SIZE = 80;
const METEOR_RADIUS = 40;

function MeteorSequence({ onAnswer, totalCorrect }) {
  const [meteors, setMeteors] = useState([]);
  const [nextExpected, setNextExpected] = useState(0);
  const [displayMode, setDisplayMode] = useState('numbers');
  const [flash, setFlash] = useState(null); // {id, type: 'correct'|'wrong'}
  const meteorsRef = useRef([]);
  const animFrameRef = useRef(null);
  const nextExpectedRef = useRef(0);
  const roundRef = useRef(0);

  const generatePuzzle = useCallback(() => {
    const round = roundRef.current;
    roundRef.current++;

    // Difficulty from SOURCE.md section 8.6
    const numMeteors = Math.min(3 + Math.floor(totalCorrect / 4), 6);
    const maxNumber = Math.min(15 + totalCorrect * 5, 100);
    const rotSpeed = Math.min(1 + Math.floor(totalCorrect / 4), 5);

    // Display mode logic from SOURCE.md
    let mode = 'numbers';
    if (round >= 6) {
      mode = 'words';
    } else if (round >= 2 && Math.random() < 0.25) {
      mode = 'letters';
    }
    setDisplayMode(mode);

    let values;
    if (mode === 'letters') {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      values = shuffled.slice(0, numMeteors).sort();
    } else if (mode === 'words') {
      // Number words: 0-10
      const nums = new Set();
      while (nums.size < numMeteors) {
        nums.add(Math.floor(Math.random() * 11));
      }
      values = Array.from(nums).sort((a, b) => a - b);
    } else {
      const nums = new Set();
      while (nums.size < numMeteors) {
        nums.add(Math.floor(Math.random() * maxNumber) + 1);
      }
      values = Array.from(nums).sort((a, b) => a - b);
    }

    // Place meteors without overlap
    const newMeteors = [];
    for (let i = 0; i < values.length; i++) {
      let x, y, attempts = 0;
      do {
        x = METEOR_RADIUS + Math.random() * (GAME_W - METEOR_SIZE);
        y = METEOR_RADIUS + Math.random() * (GAME_H - METEOR_SIZE);
        attempts++;
      } while (
        attempts < 50 &&
        newMeteors.some(m => Math.hypot(m.x - x, m.y - y) < METEOR_SIZE)
      );

      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 1.5;
      newMeteors.push({
        id: i,
        value: values[i],
        displayValue: mode === 'words' ? NUMBER_WORDS[values[i]] : String(values[i]),
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * rotSpeed * 2,
        clicked: false,
        sprite: METEOR_SPRITES[i % METEOR_SPRITES.length],
      });
    }

    meteorsRef.current = newMeteors;
    setMeteors([...newMeteors]);
    setNextExpected(0);
    nextExpectedRef.current = 0;
    setFlash(null);
  }, [totalCorrect]);

  useEffect(() => {
    roundRef.current = 0;
    generatePuzzle();
  }, [generatePuzzle]);

  // Physics animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 3); // normalize to ~60fps, cap
      lastTime = now;

      const ms = meteorsRef.current;
      for (let i = 0; i < ms.length; i++) {
        const m = ms[i];
        if (m.clicked) continue;

        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.rotation += m.rotationSpeed * dt;

        // Wall bounce
        if (m.x < METEOR_RADIUS) { m.x = METEOR_RADIUS; m.vx = Math.abs(m.vx); }
        if (m.x > GAME_W - METEOR_RADIUS) { m.x = GAME_W - METEOR_RADIUS; m.vx = -Math.abs(m.vx); }
        if (m.y < METEOR_RADIUS) { m.y = METEOR_RADIUS; m.vy = Math.abs(m.vy); }
        if (m.y > GAME_H - METEOR_RADIUS) { m.y = GAME_H - METEOR_RADIUS; m.vy = -Math.abs(m.vy); }
      }

      // Meteor-meteor collisions
      for (let i = 0; i < ms.length; i++) {
        for (let j = i + 1; j < ms.length; j++) {
          if (ms[i].clicked || ms[j].clicked) continue;
          const dx = ms[j].x - ms[i].x;
          const dy = ms[j].y - ms[i].y;
          const dist = Math.hypot(dx, dy);
          const minDist = METEOR_SIZE;

          if (dist < minDist && dist > 0.1) {
            const nx = dx / dist;
            const ny = dy / dist;
            const dvn = (ms[i].vx - ms[j].vx) * nx + (ms[i].vy - ms[j].vy) * ny;
            if (dvn > 0) {
              ms[i].vx -= dvn * nx;
              ms[i].vy -= dvn * ny;
              ms[j].vx += dvn * nx;
              ms[j].vy += dvn * ny;
            }
            // Separate
            const overlap = (minDist - dist) / 2;
            ms[i].x -= overlap * nx;
            ms[i].y -= overlap * ny;
            ms[j].x += overlap * nx;
            ms[j].y += overlap * ny;
          }
        }
      }

      setMeteors([...ms]);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleMeteorClick = useCallback((meteor) => {
    if (meteor.clicked) return;

    const ms = meteorsRef.current;
    const sortedIds = [...ms]
      .sort((a, b) => {
        if (typeof a.value === 'string') return a.value.localeCompare(b.value);
        return a.value - b.value;
      })
      .map(m => m.id);

    const expected = nextExpectedRef.current;
    if (meteor.id === sortedIds[expected]) {
      // Correct click
      const m = ms.find(m => m.id === meteor.id);
      if (m) m.clicked = true;
      meteorsRef.current = ms;

      setFlash({ id: meteor.id, type: 'correct' });
      setTimeout(() => setFlash(null), 300);

      const newExpected = expected + 1;
      nextExpectedRef.current = newExpected;
      setNextExpected(newExpected);

      if (newExpected >= ms.length) {
        onAnswer(true);
        setTimeout(() => generatePuzzle(), 400);
      }
    } else {
      // Wrong click
      setFlash({ id: meteor.id, type: 'wrong' });
      setTimeout(() => setFlash(null), 400);
      onAnswer(false);
      setTimeout(() => generatePuzzle(), 500);
    }
  }, [onAnswer, generatePuzzle]);

  // Stars (stable, generated once)
  const starsRef = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  );

  const getModeLabel = () => {
    if (displayMode === 'letters') return 'Click letters A → Z';
    return 'Click meteors smallest → largest';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '10px',
    }}>
      {/* Instruction */}
      <div style={{
        fontSize: '18px',
        color: '#2A2A2A',
        marginBottom: '8px',
        fontFamily: '"Bubblegum Sans", cursive',
        textAlign: 'center',
      }}>
        {getModeLabel()}
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '8px',
      }}>
        {meteors.map((m, i) => {
          const sorted = [...meteors].sort((a, b) => {
            if (typeof a.value === 'string') return a.value.localeCompare(b.value);
            return a.value - b.value;
          });
          const sortIdx = sorted.findIndex(s => s.id === m.id);
          return (
            <div key={i} style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: sortIdx < nextExpected ? '#6BCB77' : '#ccc',
              border: '2px solid #999',
              transition: 'background 0.2s',
            }} />
          );
        })}
      </div>

      {/* Game area - space background */}
      <div style={{
        position: 'relative',
        width: `${GAME_W}px`,
        height: `${GAME_H}px`,
        maxWidth: '100%',
        background: 'linear-gradient(180deg, #0B0B2E 0%, #1B1B4B 50%, #0B0B2E 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'default',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Stars */}
        {starsRef.current.map((star, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'white',
            borderRadius: '50%',
            opacity: star.opacity,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Meteors */}
        {meteors.map((meteor) => {
          const isFlashCorrect = flash && flash.id === meteor.id && flash.type === 'correct';
          const isFlashWrong = flash && flash.id === meteor.id && flash.type === 'wrong';

          if (meteor.clicked && !isFlashCorrect) return null;

          return (
            <div
              key={meteor.id}
              onClick={() => handleMeteorClick(meteor)}
              style={{
                position: 'absolute',
                left: `${meteor.x - METEOR_RADIUS}px`,
                top: `${meteor.y - METEOR_RADIUS}px`,
                width: `${METEOR_SIZE}px`,
                height: `${METEOR_SIZE}px`,
                cursor: meteor.clicked ? 'default' : 'pointer',
                transform: `rotate(${meteor.rotation}deg)`,
                transition: isFlashCorrect ? 'opacity 0.3s, transform 0.3s' : 'none',
                opacity: isFlashCorrect ? 0 : 1,
                filter: isFlashWrong
                  ? 'brightness(1.5) drop-shadow(0 0 10px red)'
                  : isFlashCorrect
                  ? 'brightness(1.5) drop-shadow(0 0 10px lime)'
                  : 'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))',
                userSelect: 'none',
              }}
            >
              {/* Meteor sprite */}
              <img
                src={meteor.sprite}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              {/* Number/letter overlay - counter-rotate so text stays readable */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${-meteor.rotation}deg)`,
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontFamily: '"Luckiest Guy", cursive',
                  fontSize: displayMode === 'words'
                    ? (meteor.displayValue.length > 4 ? '12px' : '14px')
                    : '22px',
                  color: '#1a1a1a',
                  textShadow: 'none',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                  textAlign: 'center',
                  padding: '2px',
                }}>
                  {meteor.displayValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MeteorSequence;
