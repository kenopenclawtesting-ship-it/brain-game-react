import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// MemorySequence - Simon-says style memory game
const SWITCH_COLORS = ['#ff5252', '#448aff', '#69f0ae', '#ffd740', '#b388ff'];

function MemorySequence({ onAnswer, totalCorrect }) {
  const [phase, setPhase] = useState('showing'); // showing, input
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [numSwitches, setNumSwitches] = useState(4);
  const [activeSwitch, setActiveSwitch] = useState(null);

  const generateSequence = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 3);
    const switches = Math.min(4 + Math.floor(difficulty / 2), 6);
    const seqLength = Math.min(3 + Math.floor((totalCorrect + 1) / 3), 8);
    
    setNumSwitches(switches);
    
    // Generate sequence (no triple repeats)
    const seq = [];
    for (let i = 0; i < seqLength; i++) {
      let next;
      do {
        next = Math.floor(Math.random() * switches);
      } while (
        seq.length >= 2 &&
        seq[seq.length - 1] === next &&
        seq[seq.length - 2] === next
      );
      seq.push(next);
    }
    
    setSequence(seq);
    setUserSequence([]);
    setCurrentShowIndex(0);
    setPhase('showing');
    setActiveSwitch(null);
  }, [totalCorrect]);

  useEffect(() => {
    generateSequence();
  }, [generateSequence]);

  // Show sequence animation
  useEffect(() => {
    if (phase === 'showing' && currentShowIndex < sequence.length) {
      const delay = Math.max(500 - totalCorrect * 15, 300);
      
      // Light up switch
      setActiveSwitch(sequence[currentShowIndex]);
      
      const timer = setTimeout(() => {
        setActiveSwitch(null);
        setTimeout(() => {
          setCurrentShowIndex(i => i + 1);
        }, 150);
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (phase === 'showing' && currentShowIndex >= sequence.length && sequence.length > 0) {
      setTimeout(() => setPhase('input'), 300);
    }
  }, [phase, currentShowIndex, sequence, totalCorrect]);

  const handleSwitchClick = (index) => {
    if (phase !== 'input') return;
    
    // Flash the switch
    setActiveSwitch(index);
    setTimeout(() => setActiveSwitch(null), 150);
    
    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);
    
    // Check if correct so far
    if (index !== sequence[userSequence.length]) {
      onAnswer(false);
      generateSequence();
      return;
    }
    
    // Check if complete
    if (newUserSequence.length === sequence.length) {
      onAnswer(true);
      setTimeout(generateSequence, 500);
    }
  };

  // Arrange switches in a circle
  const getSwitchPosition = (index, total) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radius = 100;
    return {
      x: Math.cos(angle) * radius + 150,
      y: Math.sin(angle) * radius + 120,
    };
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
        marginBottom: '15px',
        fontFamily: 'Baveuse, cursive',
      }}>
        {phase === 'showing' ? 'Watch the sequence... 👀' : 'Repeat the pattern! 🎯'}
      </div>

      {/* Progress indicator */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
      }}>
        {sequence.map((_, index) => (
          <div
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: index < userSequence.length
                ? '#00c853'
                : index < currentShowIndex && phase === 'showing'
                ? '#ffd700'
                : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Switches */}
      <div style={{ position: 'relative', width: '300px', height: '250px' }}>
        {Array.from({ length: numSwitches }).map((_, index) => {
          const pos = getSwitchPosition(index, numSwitches);
          const isActive = activeSwitch === index;
          
          return (
            <motion.button
              key={index}
              animate={{
                scale: isActive ? 1.2 : 1,
                boxShadow: isActive
                  ? `0 0 30px ${SWITCH_COLORS[index % SWITCH_COLORS.length]}`
                  : '0 4px 10px rgba(0,0,0,0.3)',
              }}
              whileHover={phase === 'input' ? { scale: 1.1 } : {}}
              whileTap={phase === 'input' ? { scale: 0.95 } : {}}
              onClick={() => handleSwitchClick(index)}
              style={{
                position: 'absolute',
                left: pos.x - 35,
                top: pos.y - 35,
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: isActive
                  ? SWITCH_COLORS[index % SWITCH_COLORS.length]
                  : `linear-gradient(180deg, ${SWITCH_COLORS[index % SWITCH_COLORS.length]}88, ${SWITCH_COLORS[index % SWITCH_COLORS.length]}44)`,
                border: `4px solid ${SWITCH_COLORS[index % SWITCH_COLORS.length]}`,
                cursor: phase === 'input' ? 'pointer' : 'default',
              }}
            />
          );
        })}
        
        {/* Center indicator */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '40px',
        }}>
          🧠
        </div>
      </div>
    </div>
  );
}

export default MemorySequence;
