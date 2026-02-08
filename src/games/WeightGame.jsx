import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// WeightGame (Balance Scale) - Determine heaviest object from scale comparisons
const ITEMS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍑', '🍐'];

function WeightGame({ onAnswer, totalCorrect }) {
  const [scales, setScales] = useState([]);
  const [items, setItems] = useState([]);
  const [heaviestItem, setHeaviestItem] = useState(null);

  const generatePuzzle = useCallback(() => {
    const numScales = Math.min(1 + Math.floor(totalCorrect / 8), 4);
    const numItems = numScales + 2;
    
    // Assign random weights to items
    const selectedItems = ITEMS.slice(0, numItems);
    const weights = selectedItems.map((item, i) => ({
      item,
      weight: (i + 1) * 10 + Math.floor(Math.random() * 5),
    }));
    
    // Sort by weight to find heaviest
    weights.sort((a, b) => b.weight - a.weight);
    const heaviest = weights[0].item;
    
    // Generate scale comparisons that allow deduction
    const newScales = [];
    for (let i = 0; i < numScales; i++) {
      const idx1 = i;
      const idx2 = i + 1;
      const item1 = weights[idx1];
      const item2 = weights[idx2];
      
      newScales.push({
        left: item1.item,
        right: item2.item,
        result: item1.weight > item2.weight ? 'left' : item1.weight < item2.weight ? 'right' : 'equal',
      });
    }
    
    // Shuffle items for display
    const shuffledItems = [...selectedItems].sort(() => Math.random() - 0.5);
    
    setScales(newScales);
    setItems(shuffledItems);
    setHeaviestItem(heaviest);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleItemClick = (item) => {
    const isCorrect = item === heaviestItem;
    onAnswer(isCorrect);
    generatePuzzle();
  };

  const renderScale = (scale, index) => {
    const tiltAngle = scale.result === 'left' ? -10 : scale.result === 'right' ? 10 : 0;
    
    return (
      <div key={index} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '10px',
      }}>
        {/* Scale beam */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: tiltAngle }}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            width: '140px',
            height: '40px',
            background: 'linear-gradient(180deg, #8b4513, #654321)',
            borderRadius: '5px',
            padding: '5px 10px',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: '28px' }}>{scale.left}</span>
          <span style={{ fontSize: '28px' }}>{scale.right}</span>
        </motion.div>
        {/* Scale base */}
        <div style={{
          width: '10px',
          height: '30px',
          background: '#8b4513',
        }} />
        <div style={{
          width: '60px',
          height: '10px',
          background: '#654321',
          borderRadius: '3px',
        }} />
      </div>
    );
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
      {/* Question */}
      <div style={{
        fontSize: '22px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '15px',
        fontFamily: 'Baveuse, cursive',
        textAlign: 'center',
      }}>
        Which is the HEAVIEST? ⚖️
      </div>

      {/* Scales display */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '20px',
        maxWidth: '350px',
      }}>
        {scales.map((scale, index) => renderScale(scale, index))}
      </div>

      {/* Item choices */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {items.map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleItemClick(item)}
            style={{
              width: '70px',
              height: '70px',
              fontSize: '40px',
              background: 'linear-gradient(180deg, #4a5568, #2d3748)',
              border: '3px solid rgba(255,255,255,0.2)',
              borderRadius: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default WeightGame;
