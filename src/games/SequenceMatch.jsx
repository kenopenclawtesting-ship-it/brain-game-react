import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// SequenceMatch (Hex Path) - Match sequences on a hexagon grid
const COLORS = ['#ff5252', '#448aff', '#69f0ae', '#ffd740', '#b388ff', '#00bcd4'];

function SequenceMatch({ onAnswer, totalCorrect }) {
  const [grid, setGrid] = useState([]);
  const [targetSequence, setTargetSequence] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [gridSize, setGridSize] = useState({ rows: 3, cols: 3 });

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.min(Math.floor(totalCorrect / 2), 10);
    const rows = Math.min(3 + Math.floor(difficulty / 3), 5);
    const cols = Math.min(3 + Math.floor(difficulty / 3), 5);
    const seqLength = Math.min(2 + Math.floor(difficulty / 2), 4);
    
    setGridSize({ rows, cols });
    
    // Generate grid with random colors
    const newGrid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          id: `${r}-${c}`,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          row: r,
          col: c,
        });
      }
      newGrid.push(row);
    }
    
    // Generate target sequence (adjacent cells)
    const startRow = Math.floor(Math.random() * rows);
    const startCol = Math.floor(Math.random() * cols);
    const sequence = [newGrid[startRow][startCol]];
    
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // Up, Down, Left, Right
      [-1, -1], [-1, 1], [1, -1], [1, 1], // Diagonals
    ];
    
    let currentRow = startRow;
    let currentCol = startCol;
    
    for (let i = 1; i < seqLength; i++) {
      const validDirs = directions.filter(([dr, dc]) => {
        const nr = currentRow + dr;
        const nc = currentCol + dc;
        return nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !sequence.find(s => s.row === nr && s.col === nc);
      });
      
      if (validDirs.length === 0) break;
      
      const [dr, dc] = validDirs[Math.floor(Math.random() * validDirs.length)];
      currentRow += dr;
      currentCol += dc;
      sequence.push(newGrid[currentRow][currentCol]);
    }
    
    setGrid(newGrid);
    setTargetSequence(sequence);
    setSelectedCells([]);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleCellClick = (cell) => {
    const isAlreadySelected = selectedCells.find(s => s.id === cell.id);
    
    if (isAlreadySelected) {
      // Deselect if it's the last one
      if (selectedCells[selectedCells.length - 1].id === cell.id) {
        setSelectedCells(selectedCells.slice(0, -1));
      }
      return;
    }
    
    // Check if adjacent to last selected (or first selection)
    if (selectedCells.length > 0) {
      const last = selectedCells[selectedCells.length - 1];
      const rowDiff = Math.abs(cell.row - last.row);
      const colDiff = Math.abs(cell.col - last.col);
      if (rowDiff > 1 || colDiff > 1) return; // Not adjacent
    }
    
    const newSelected = [...selectedCells, cell];
    setSelectedCells(newSelected);
    
    // Check if matches target sequence
    if (newSelected.length === targetSequence.length) {
      const matchesForward = newSelected.every((s, i) => s.id === targetSequence[i].id);
      const matchesBackward = newSelected.every((s, i) => s.id === targetSequence[targetSequence.length - 1 - i].id);
      
      if (matchesForward || matchesBackward) {
        onAnswer(true);
        setTimeout(generatePuzzle, 500);
      } else {
        onAnswer(false);
        generatePuzzle();
      }
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
        marginBottom: '15px',
        fontFamily: 'Baveuse, cursive',
      }}>
        Find this sequence in the grid:
      </div>

      {/* Target sequence */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        padding: '10px 15px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '10px',
      }}>
        {targetSequence.map((cell, index) => (
          <React.Fragment key={cell.id}>
            <div
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '8px',
                background: cell.color,
                border: '2px solid white',
              }}
            />
            {index < targetSequence.length - 1 && (
              <span style={{ color: 'white', alignSelf: 'center' }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize.cols}, 50px)`,
        gap: '8px',
      }}>
        {grid.flat().map((cell) => {
          const isSelected = selectedCells.find(s => s.id === cell.id);
          const selectionIndex = selectedCells.findIndex(s => s.id === cell.id);
          
          return (
            <motion.button
              key={cell.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCellClick(cell)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                background: cell.color,
                border: isSelected ? '3px solid white' : '3px solid rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontFamily: 'Baveuse, cursive',
                color: 'white',
                textShadow: '1px 1px 2px black',
              }}
            >
              {isSelected && selectionIndex + 1}
            </motion.button>
          );
        })}
      </div>

      {/* Selection count */}
      <div style={{
        marginTop: '15px',
        fontSize: '16px',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Baveuse, cursive',
      }}>
        Selected: {selectedCells.length} / {targetSequence.length}
      </div>
    </div>
  );
}

export default SequenceMatch;
