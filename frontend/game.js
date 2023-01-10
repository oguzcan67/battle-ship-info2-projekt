// Note MA: Always wrap JS Code in a function and don't declare global variables if not absolutely neccessary. Seearch 'Module Pattern' for further Information
(function(){
  // declararation of variables
  // Create the game board as a two-dimensional array of squares
  const rows = 10;
  const cols = 10;
  let board = [];
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      board[i][j] = {
        x: i,
        y: j,
        occupied: false, // Will be set to true if there is a ship at this square
        hit: false // Will be set to true if this square has been targeted
      };
    }
  }

  // Function to render the game board to the DOM
  function renderBoard() {
    let boardHTML = '';

    renderHeader();

    for (let i = 0; i < rows; i++) {
        boardHTML += '<div class="row">';
        for (let j = 0; j < cols; j++) {
          let square = board[i][j];
          let className = 'square';
          if (square.occupied) {
            className += ' occupied';
          }
          if (square.hit) {
            className += ' hit';
          }
          if (j === 0) {
            // Render Sidebar indice as first element of the row
            boardHTML += '<div class="counterWrapper"><span>' + i + '</span></div>';
          }
          boardHTML += `<div class="${className}" data-x="${square.x}" data-y="${square.y}"></div>`;
        }
        boardHTML += '</div>';
      }
    document.getElementById('innerBoard').innerHTML = boardHTML;
  }

  function renderHeader() {
    let headerHTMl = '';
    for (let i = 0; i < (rows + 1); i++) {
      const shownCounter = i !== 0 ? i - 1 : '';

      headerHTMl += '<div class="counterWrapper"><span>' + shownCounter  + '</span></div>';
    }

    document.querySelector('.header .row').innerHTML = headerHTMl;
  }

// Animate the square when a ship is hit
  function animateHit(x, y) {
    let square = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    square.classList.add('hit-animation');
    setTimeout(() => {
      square.classList.remove('hit-animation');
    }, 500);
  }

// Place ships on the game board
  placeShip(5); // Place a ship of length 5
  placeShip(4); // Place a ship of length 4
  placeShip(3); // Place a ship of length 3
  placeShip(3); // Place a ship of length 3
  placeShip(2); // Place a ship of length 2

  function placeShip(length) {
    // Generate random coordinates for the start of the ship
    let x = Math.floor(Math.random() * rows);
    let y = Math.floor(Math.random() * cols);
    // Generate a random number between 0 and 3 to determine the direction of the ship
    let direction = Math.floor(Math.random() * 4);
    let placed = false;
    while (!placed) {
      // Check if there is enough space to place the ship starting at the given coordinates
      if (canPlaceShip(x, y, length, direction)) {
        // Mark the squares as occupied
        for (let i = 0; i < length; i++) {
          if (direction === 0) {
            // Place the ship horizontally to the right
            board[x][y + i].occupied = true;
          } else if (direction === 1) {
            // Place the ship vertically downwards
            board[x + i][y].occupied = true;
          } else if (direction === 2) {
            // Place the ship horizontally to the left
            board[x][y - i].occupied = true;
          } else if (direction === 3) {
            // Place the ship vertically upwards
            board[x - i][y].occupied = true;
          }
        }
        placed = true;
      } else {
        // Generate new coordinates if the ship could not be placed at the current coordinates
        x = Math.floor(Math.random() * rows);
        y = Math.floor(Math.random() * cols);
        direction = Math.floor(Math.random() * 4);
      }
    }
  }

// Function to check if a ship can be placed at the given coordinates
  function canPlaceShip(x, y, length, direction) {
    if (direction === 0) {
      // Check if there is enough space to the right of the starting coordinates
      if (y + length > cols) {
        return false;
      }
      // Check if any of the squares are already occupied
      for (let i = 0; i < length; i++) {
        if (board[x][y + i].occupied) {
          return false;
        }
      }
      return true;
    } else if (direction === 1) {
      // Check if there
//is enough space below the starting coordinates
      if (x + length > rows) {
        return false;
      }
      // Check if any of the squares are already occupied
      for (let i = 0; i < length; i++) {
        if (board[x + i][y].occupied) {
          return false;
        }
      }
      return true;
    } else if (direction === 2) {
      // Check if there is enough space to the left of the starting coordinates
      if (y - length < -1) {
        return false;
      }
      // Check if any of the squares are already occupied
      for (let i = 0; i < length; i++) {
        if (board[x][y - i].occupied) {
          return false;
        }
      }
      return true;
    } else if (direction === 3) {
      // Check if there is enough space above the starting coordinates
      if (x - length < -1) {
        return false;
      }
      // Check if any of the squares are already occupied
      for (let i = 0; i < length; i++) {
        if (board[x - i][y].occupied) {
          return false;
        }
      }
      return true;
    }
  }

// Handle user clicks on the game board
  document.getElementById('board').addEventListener('click', e => {
    // Get the x and y coordinates of the clicked square
    let x = e.target.getAttribute('data-x');
    let y = e.target.getAttribute('data-y');
    if (x !== null && y !== null) {
      // Send a request to the backend to register the move
      makeMove(x, y);
    }
  });

// Function to send a request to the backend to register a move made by the user
  function makeMove(x, y) {
    fetch('/make-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({x: x, y: y})
    })
        .then(response => response.json())
        .then(result => {
          if (result.hit) {
            // Mark the square as hit and animate it if the move was a hit
            board[x][y].hit = true;
            animateHit(x, y);
          }
          renderBoard();
        });
  }

// Initialize the game by rendering the board to the DOM
  renderBoard();
})();