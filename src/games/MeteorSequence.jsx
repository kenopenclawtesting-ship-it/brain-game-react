import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

// MeteorSequence - Click floating meteors in ascending order
function MeteorSequence({ onAnswer, totalCorrect }) {
  const [meteors, setMeteors] = useState([]);
  const [clickedOrder, setClickedOrder] = useState([]);
  const [nextExpected, setNextExpected] = useState(0);
  const containerRef = useRef(null);

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 4);
    const numMeteors = Math.min(3 + difficulty, 7);
    const maxNumber = Math.min(15 + totalCorrect * 5, 50);
    
    // Generate unique random numbers
    const numbers = new Set();
    while (numbers.size < numMeteors) {
      numbers.add(Math.floor(Math.random() * maxNumber) + 1);
    }
    
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    
    // Create meteors with random positions
    const newMeteors = sortedNumbers.map((num, index) => ({
      id: index,
      number: num,
      x: 50 + Math.random() * 250,
      y: 30 + Math.random() * 180,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      clicked: false,
    }));
    
    setMeteors(newMeteors);
    setClickedOrder([]);
    setNextExpected(0);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Animate meteors
  useEffect(() => {
    const interval = setInterval(() => {
      setMeteors(prev => prev.map(meteor => {
        if (meteor.clicked) return meteor;
        
        let newX = meteor.x + meteor.speedX;
        let newY = meteor.y + meteor.speedY;
        let newSpeedX = meteor.speedX;
        let newSpeedY = meteor.speedY;
        
        // Bounce off walls
        if (newX < 30 || newX > 320) newSpeedX *= -1;
        if (newY < 20 || newY > 220) newSpeedY *= -1;
        
        return {
          ...meteor,
          x: Math.max(30, Math.min(320, newX)),
          y: Math.max(20, Math.min(220, newY)),
          speedX: newSpeedX,
          speedY: newSpeedY,
          rotation: meteor.rotation + 1,
        };
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  const handleMeteorClick = (meteor) => {
    if (meteor.clicked) return;
    
    const sortedMeteors = [...meteors].sort((a, b) => a.number - b.number);
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
        fontSize: '20px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '10px',
        fontFamily: 'Baveuse, cursive',
      }}>
        Click meteors in order: smallest → largest ☄️
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
              x: meteor.x,
              y: meteor.y,
              rotate: meteor.rotation,
              scale: meteor.clicked ? 0 : 1,
              opacity: meteor.clicked ? 0 : 1,
            }}
            whileHover={!meteor.clicked ? { scale: 1.2 } : {}}
            whileTap={!meteor.clicked ? { scale: 0.9 } : {}}
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
              fontSize: '18px',
              color: 'white',
              textShadow: '1px 1px 2px black',
              boxShadow: meteor.clicked ? 'none' : '0 0 15px rgba(255, 150, 50, 0.5)',
            }}
          >
            {!meteor.clicked && meteor.number}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default MeteorSequence;
