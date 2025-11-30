export function classifyBoard() {
  // Placeholder for manual classification (e.g., via database or image difference)
  return null;
}

export function getBoardDiff(prevBoard, newBoard) {
  let from = null;
  let to = null;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const prevPiece = prevBoard[row][col];
      const newPiece = newBoard[row][col];

      if (prevPiece && !newPiece) from = { row, col };  // vacated
      if (!prevPiece && newPiece) to = { row, col };    // newly occupied
    }
  }

  if (from && to) {
    return {
      from: toChessNotation(from.row, from.col),
      to: toChessNotation(to.row, to.col),
      piece: prevBoard[from.row][from.col],
    };
  }

  return null;
}

function toChessNotation(row, col) {
  const files = "abcdefgh";
  return files[col] + (8 - row);
}