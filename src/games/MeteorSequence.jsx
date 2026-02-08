import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

// MeteorSequence - Click floating meteors in ascending order
// From SOURCE.md:
// - At round 2 (25% chance): Shows LETTERS (A-Z) instead of numbers
// - At round 6+: Shows NUMBER WORDS ("THREE", "FIVE") instead of digits
// - Meteors BOUNCE off each other

const NUMBER_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];

function MeteorSequence({ onAnswer, totalCorrect }) {
  const [meteors, setMeteors] = useState([]);
  const [clickedOrder, setClickedOrder] = useState([]);
  const [nextExpected, setNextExpected] = useState(0);
  const [displayMode, setDisplayMode] = useState('numbers'); // numbers, letters, words
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 4);
    const numMeteors = Math.min(3 + difficulty, 7);
    const round = totalCorrect;
    
    // Determine display mode
    let mode = 'numbers';
    if (round >= 6 && Math.random() < 0.5) {
      mode = 'words';
    } else if (round >= 2 && Math.random() < 0.25) {
      mode = 'letters';
    }
    setDisplayMode(mode);
    
    let values;
    if (mode === 'letters') {
      // Generate unique random letters
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const shuffled = letters.sort(() => Math.random() - 0.5);
      values = shuffled.slice(0, numMeteors).sort();
    } else {
      // Generate unique random numbers
      const maxNumber = mode === 'words' 
        ? Math.min(10, numMeteors + 3) 
        : Math.min(15 + totalCorrect * 5, 50);
      const numbers = new Set();
      while (numbers.size < numMeteors) {
        const num = mode === 'words' 
          ? Math.floor(Math.random() * Math.min(11, maxNumber))
          : Math.floor(Math.random() * maxNumber) + 1;
        numbers.add(num);
      }
      values = Array.from(numbers).sort((a, b) => a - b);
    }
    
    // Create meteors with random positions and velocities
    const newMeteors = values.map((value, index) => ({
      id: index,
      value,
      displayValue: mode === 'words' ? NUMBER_WORDS[value] : value,
      x: 50 + Math.random() * 250,
      y: 30 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      clicked: false,
      radius: 25,
    }));
    
    setMeteors(newMeteors);
    setClickedOrder([]);
    setNextExpected(0);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Animate meteors with bouncing physics
  useEffect(() => {
    const animate = () => {
      setMeteors(prev => {
        const updated = prev.map(meteor => {
          if (meteor.clicked) return meteor;
          
          let newX = meteor.x + meteor.vx;
          let newY = meteor.y + meteor.vy;
          let newVx = meteor.vx;
          let newVy = meteor.vy;
          
          // Bounce off walls
          if (newX < 30) { newX = 30; newVx = Math.abs(newVx); }
          if (newX > 320) { newX = 320; newVx = -Math.abs(newVx); }
          if (newY < 20) { newY = 20; newVy = Math.abs(newVy); }
          if (newY > 220) { newY = 220; newVy = -Math.abs(newVy); }
          
          return {
            ...meteor,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: meteor.rotation + meteor.rotationSpeed,
          };
        });
        
        // Bounce meteors off each other
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const m1 = updated[i];
            const m2 = updated[j];
            if (m1.clicked || m2.clicked) continue;
            
            const dx = m2.x - m1.x;
            const dy = m2.y - m1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = m1.radius + m2.radius;
            
            if (dist < minDist && dist > 0) {
              // Collision! Swap velocities along collision axis
              const nx = dx / dist;
              const ny = dy / dist;
              const dvx = m1.vx - m2.vx;
              const dvy = m1.vy - m2.vy;
              const dvn = dvx * nx + dvy * ny;
              
              if (dvn > 0) {
                updated[i] = { ...m1, vx: m1.vx - dvn * nx, vy: m1.vy - dvn * ny };
                updated[j] = { ...m2, vx: m2.vx + dvn * nx, vy: m2.vy + dvn * ny };
              }
            }
          }
        }
        
        return updated;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleMeteorClick = (meteor) => {
    if (meteor.clicked) return;
    
    const sortedMeteors = [...meteors].sort((a, b) => {
      if (displayMode === 'letters') {
        return a.value.localeCompare(b.value);
      }
      return a.value - b.value;
    });
    const expectedMeteor = sortedMeteors[nextExpected];
    
    if (meteor.id === expectedMeteor.id) {
      // Correct!
      setMeteors(prev => prev.map(m => 
        m.id === meteor.id ? { ...m, clicked: true } : m
      ));
      setClickedOrder(prev => [...prev, meteor.id]);
      
      if (nextExpected === meteors.length - 1) {
        // All correct!
        onAnswer(true);
        setTimeout(generatePuzzle, 500);
      } else {
        setNextExpected(nextExpected + 1);
      }
    } else {
      // Wrong!
      onAnswer(false);
      generatePuzzle();
    }
  };

  const getModeLabel = () => {
    switch (displayMode) {
      case 'letters': return 'A → Z';
      case 'words': return 'smallest → largest';
      default: return 'smallest → largest';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
    }}>
      <div style={{
        fontSize: '18px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '10px',
        fontFamily: 'Baveuse, cursive',
      }}>
        Click {displayMode === 'letters' ? 'letters' : 'meteors'} in order: {getModeLabel()} ☄️
      </div>

      {/* Progress */}
      <div style={{
        fontSize: '16px',
        color: '#ffd700',
        marginBottom: '10px',
        fontFamily: 'Baveuse, cursive',
      }}>
        {clickedOrder.length} / {meteors.length}
      </div>

      {/* Game area */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '360px',
          height: '260px',
          background: 'linear-gradient(180deg, #0a0a20 0%, #1a1a40 100%)',
          borderRadius: '15px',
          border: '3px solid rgba(255,255,255,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Stars background */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: Math.random() * 360,
              top: Math.random() * 260,
              width: '2px',
              height: '2px',
              background: 'white',
              borderRadius: '50%',
              opacity: 0.3 + Math.random() * 0.7,
            }}
          />
        ))}
        
        {/* Meteors */}
        {meteors.map((meteor) => (
          <motion.button
            key={meteor.id}
            animate={{
              x: meteor.x - 25,
              y: meteor.y - 25,
              rotate: meteor.rotation,
              scale: meteor.clicked ? 0 : 1,
              opacity: meteor.clicked ? 0 : 1,
            }}
            transition={{ type: 'tween', duration: 0.05 }}
            whileHover={!meteor.clicked ? { scale: 1.2 } : {}}
            onClick={() => handleMeteorClick(meteor)}
            style={{
              position: 'absolute',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: meteor.clicked
                ? 'transparent'
                : 'radial-gradient(circle at 30% 30%, #8b7355, #4a3728)',
              border: meteor.clicked ? 'none' : '2px solid #a08060',
              cursor: meteor.clicked ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Baveuse, cursive',
              fontSize: displayMode === 'words' ? '10px' : '16px',
              color: 'white',
              textShadow: '1px 1px 2px black',
              boxShadow: meteor.clicked ? 'none' : '0 0 15px rgba(255, 150, 50, 0.5)',
              padding: '2px',
              textAlign: 'center',
              lineHeight: '1.1',
            }}
          >
            {!meteor.clicked && meteor.displayValue}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default MeteorSequence;
