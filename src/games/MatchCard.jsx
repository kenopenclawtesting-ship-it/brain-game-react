import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
 * MatchCard (Card Pairs) — 1:1 replica of the original Flash game
 *
 * EASY symbols (colors): red, blue, green, yellow, grey
 * HARD symbols (shapes): circle, square, star, triangle, dots
 * numPairs = min(2 + floor(round/2), 5)
 * numSwaps = floor(round/3)  — cards swap positions after reveal!
 * Reveal time: 2000ms
 * Points: +26 correct, -18 incorrect
 */

// Card face sprites — these are the symbol images shown on the front
const EASY_CARDS = [
  { id: 'red',    sprite: '/sprites/DefineSprite_455_Card_red/1.png' },
  { id: 'blue',   sprite: '/sprites/DefineSprite_770_Card_blue/1.png' },
  { id: 'green',  sprite: '/sprites/DefineSprite_768_Card_green/1.png' },
  { id: 'yellow', sprite: '/sprites/DefineSprite_453_Card_yellow/1.png' },
  { id: 'grey',   sprite: '/sprites/DefineSprite_457_Card_grey/1.png' },
];

const HARD_CARDS = [
  { id: 'circle',   sprite: '/sprites/DefineSprite_465_Card_circle/1.png' },
  { id: 'square',   sprite: '/sprites/DefineSprite_463_Card_square/1.png' },
  { id: 'star',     sprite: '/sprites/DefineSprite_461_Card_star/1.png' },
  { id: 'triangle', sprite: '/sprites/DefineSprite_467_Card_triangle/1.png' },
  { id: 'dots',     sprite: '/sprites/DefineSprite_459_Card_dots/1.png' },
];

const CARD_BACK = '/sprites/DefineSprite_469_Cardfront/1.png';   // brain logo = back
const CARD_BLANK = '/sprites/DefineSprite_472_Cardback/1.png';   // white = front bg

// Shuffle helper (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchCard({ onAnswer, totalCorrect }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState(new Set());
  const [matched, setMatched] = useState(new Set());
  const [selected, setSelected] = useState([]);        // currently selected card indices
  const [isChecking, setIsChecking] = useState(false);
  const [phase, setPhase] = useState('reveal');         // reveal | swapping | playing | complete
  const [round, setRound] = useState(0);
  const [disappearing, setDisappearing] = useState(new Set());
  const roundRef = useRef(0);
  const cardsRef = useRef([]);

  // Generate a new board
  const generateCards = useCallback((r) => {
    const numPairs = Math.min(2 + Math.floor(r / 2), 5);
    const useHard = r >= 3;
    const pool = useHard ? HARD_CARDS : EASY_CARDS;
    const selectedTypes = shuffle(pool).slice(0, numPairs);

    let deck = [];
    selectedTypes.forEach((type, i) => {
      deck.push({ idx: i * 2,     pairId: type.id, sprite: type.sprite });
      deck.push({ idx: i * 2 + 1, pairId: type.id, sprite: type.sprite });
    });
    deck = shuffle(deck);
    // Assign position indices
    deck = deck.map((c, pos) => ({ ...c, pos }));

    cardsRef.current = deck;
    setCards(deck);
    setFlipped(new Set(deck.map(c => c.pos)));   // all face-up
    setMatched(new Set());
    setSelected([]);
    setDisappearing(new Set());
    setIsChecking(false);
    setPhase('reveal');

    // After 2000ms, hide cards then possibly swap
    setTimeout(() => {
      setFlipped(new Set());

      const numSwaps = Math.floor(r / 3);
      if (numSwaps > 0) {
        setPhase('swapping');
        // perform swaps with animation
        setTimeout(() => {
          let swapped = [...cardsRef.current];
          for (let s = 0; s < numSwaps; s++) {
            const a = Math.floor(Math.random() * swapped.length);
            let b = Math.floor(Math.random() * swapped.length);
            while (b === a) b = Math.floor(Math.random() * swapped.length);
            // swap positions
            const tmpPos = swapped[a].pos;
            swapped[a] = { ...swapped[a], pos: swapped[b].pos };
            swapped[b] = { ...swapped[b], pos: tmpPos };
          }
          // Re-sort by position
          swapped.sort((x, y) => x.pos - y.pos);
          cardsRef.current = swapped;
          setCards(swapped);
          setTimeout(() => setPhase('playing'), 400);
        }, 300);
      } else {
        setPhase('playing');
      }
    }, 2000);
  }, []);

  useEffect(() => {
    generateCards(0);
  }, [generateCards]);

  const handleCardClick = useCallback((pos) => {
    if (phase !== 'playing' || isChecking) return;
    if (flipped.has(pos) || matched.has(pos) || disappearing.has(pos)) return;

    const newFlipped = new Set(flipped);
    newFlipped.add(pos);
    setFlipped(newFlipped);

    const newSelected = [...selected, pos];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      const [posA, posB] = newSelected;
      const cardA = cardsRef.current.find(c => c.pos === posA);
      const cardB = cardsRef.current.find(c => c.pos === posB);

      setTimeout(() => {
        if (cardA.pairId === cardB.pairId) {
          // Match!
          onAnswer(true);
          // Start disappear animation
          setDisappearing(prev => {
            const next = new Set(prev);
            next.add(posA);
            next.add(posB);
            return next;
          });
          
          setTimeout(() => {
            const newMatched = new Set(matched);
            newMatched.add(posA);
            newMatched.add(posB);
            setMatched(newMatched);
            setFlipped(new Set());
            setSelected([]);
            setIsChecking(false);
            setDisappearing(prev => {
              const next = new Set(prev);
              next.delete(posA);
              next.delete(posB);
              return next;
            });

            // Check if all matched
            if (newMatched.size === cardsRef.current.length) {
              setPhase('complete');
              const nextRound = roundRef.current + 1;
              roundRef.current = nextRound;
              setRound(nextRound);
              setTimeout(() => generateCards(nextRound), 600);
            }
          }, 400);
        } else {
          // Mismatch
          onAnswer(false);
          setTimeout(() => {
            setFlipped(new Set());
            setSelected([]);
            setIsChecking(false);
          }, 500);
        }
      }, 600);
    }
  }, [phase, isChecking, flipped, matched, selected, disappearing, onAnswer, generateCards]);

  // Layout: cards in a grid. Original uses ~81x101 cards.
  const numCards = cards.length;
  const cols = numCards <= 4 ? 2 : numCards <= 6 ? 3 : numCards <= 8 ? 4 : 5;
  const rows = Math.ceil(numCards / cols);

  // Card sizing
  const cardW = 81;
  const cardH = 101;
  const gap = 12;
  const gridW = cols * cardW + (cols - 1) * gap;
  const gridH = rows * cardH + (rows - 1) * gap;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
      userSelect: 'none',
    }}>
      {/* Status text */}
      {phase === 'swapping' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginBottom: 12,
            fontFamily: "'Bubblegum Sans', cursive",
            fontSize: 20,
            color: '#E03030',
            fontWeight: 'bold',
          }}
        >
          Cards are swapping!
        </motion.div>
      )}

      {/* Card grid */}
      <div style={{
        position: 'relative',
        width: gridW,
        height: gridH,
      }}>
        {cards.map((card) => {
          const isUp = flipped.has(card.pos) || disappearing.has(card.pos);
          const isGone = matched.has(card.pos);
          const isDis = disappearing.has(card.pos);
          const col = card.pos % cols;
          const row = Math.floor(card.pos / cols);
          const x = col * (cardW + gap);
          const y = row * (cardH + gap);

          if (isGone) return null;

          return (
            <motion.div
              key={card.idx}
              layout
              animate={{
                left: x,
                top: y,
                opacity: isDis ? 0 : 1,
                scale: isDis ? 0.7 : 1,
              }}
              transition={{
                left: { type: 'spring', stiffness: 300, damping: 25 },
                top: { type: 'spring', stiffness: 300, damping: 25 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              onClick={() => handleCardClick(card.pos)}
              style={{
                position: 'absolute',
                width: cardW,
                height: cardH,
                cursor: (phase === 'playing' && !isUp && !isGone) ? 'pointer' : 'default',
                perspective: 600,
              }}
            >
              {/* Card flip container */}
              <motion.div
                animate={{ rotateY: isUp ? 180 : 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Back face (brain logo) */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
                }}>
                  <img
                    src={CARD_BACK}
                    alt="card back"
                    draggable={false}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                </div>
                {/* Front face (symbol) */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* White card background */}
                  <img
                    src={CARD_BLANK}
                    alt=""
                    draggable={false}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  {/* Symbol on top */}
                  <img
                    src={card.sprite}
                    alt={card.pairId}
                    draggable={false}
                    style={{
                      position: 'relative',
                      width: '70%',
                      height: '70%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Pairs counter */}
      <div style={{
        marginTop: 16,
        fontSize: 18,
        fontFamily: "'Bubblegum Sans', cursive",
        color: '#4a3728',
      }}>
        Pairs found: {matched.size / 2} / {cards.length / 2}
      </div>
    </div>
  );
}

export default MatchCard;
