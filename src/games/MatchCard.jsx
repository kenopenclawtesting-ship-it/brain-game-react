import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// MatchCard (Card Pairs) - Memory matching game
const CARD_COLORS = ['#ff5252', '#448aff', '#69f0ae', '#ffd740', '#b388ff', '#ff80ab'];
const CARD_SHAPES = ['●', '■', '★', '▲', '◆', '♦'];

function MatchCard({ onAnswer, totalCorrect }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [round, setRound] = useState(0);

  const generateCards = useCallback(() => {
    const numPairs = Math.min(2 + Math.floor(round / 2), 6);
    const useShapes = round >= 3;
    
    const values = useShapes ? CARD_SHAPES : CARD_COLORS;
    const selectedValues = values.slice(0, numPairs);
    
    // Create pairs
    let deck = [];
    selectedValues.forEach((value, index) => {
      deck.push({ id: index * 2, value, matched: false });
      deck.push({ id: index * 2 + 1, value, matched: false });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    
    // Brief reveal at start
    setFlipped(deck.map(c => c.id));
    setTimeout(() => setFlipped([]), 2000);
  }, [round]);

  useEffect(() => {
    generateCards();
  }, [generateCards]);

  const handleCardClick = (cardId) => {
    if (isChecking || flipped.includes(cardId) || matched.includes(cardId)) return;
    
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [first, second] = newFlipped;
      const card1 = cards.find(c => c.id === first);
      const card2 = cards.find(c => c.id === second);
      
      setTimeout(() => {
        if (card1.value === card2.value) {
          // Match found
          const newMatched = [...matched, first, second];
          setMatched(newMatched);
          onAnswer(true);
          
          // Check if all matched
          if (newMatched.length === cards.length) {
            setRound(r => r + 1);
            setTimeout(generateCards, 500);
          }
        } else {
          onAnswer(false);
        }
        
        setFlipped([]);
        setIsChecking(false);
      }, 800);
    }
  };

  const numCols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 5;

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
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
        gap: '10px',
        maxWidth: '400px',
      }}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);
          
          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: isFlipped ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              animate={{
                rotateY: isFlipped ? 180 : 0,
                opacity: isMatched ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: '60px',
                height: '80px',
                borderRadius: '10px',
                cursor: isFlipped ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                background: isFlipped
                  ? (CARD_COLORS.includes(card.value) ? card.value : 'white')
                  : 'linear-gradient(180deg, #4a5568, #2d3748)',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                color: CARD_SHAPES.includes(card.value) ? '#1a1a2e' : 'white',
              }}
            >
              {isFlipped && CARD_SHAPES.includes(card.value) ? card.value : ''}
            </motion.div>
          );
        })}
      </div>
      
      <div style={{
        marginTop: '20px',
        fontSize: '18px',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Baveuse, cursive',
      }}>
        Pairs found: {matched.length / 2} / {cards.length / 2}
      </div>
    </div>
  );
}

export default MatchCard;
