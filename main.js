let boardSquaresArray = [];
let isWhiteTurn = true;
let whiteKingSquare="e1";
let blackKingSquare="e8";
const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");

function fillBoardSquaresArray() {
  const boardSquares = document.getElementsByClassName("square");
  for (let i = 0; i < boardSquares.length; i++) {
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    let square = boardSquares[i];
    square.id = column + row;
    let color = "";
    let pieceType = "";
    let pieceId="";
    if (square.querySelector(".piece")) {
      color = square.querySelector(".piece").getAttribute("color");
      pieceType = square.querySelector(".piece").classList[1];
      pieceId=square.querySelector(".piece").id;
    } else {
      color = "blank";
      pieceType = "blank";
      pieceId ="blank";
    }
    let arrayElement = {
      squareId: square.id,
      pieceColor: color,
      pieceType: pieceType,
      pieceId:pieceId
    };
    boardSquaresArray.push(arrayElement);
  }
}
function updateBoardSquaresArray(
  currentSquareId,
  destinationSquareId,
  boardSquaresArray
) {
  let currentSquare = boardSquaresArray.find(
    (element) => element.squareId === currentSquareId
  );
  let destinationSquareElement = boardSquaresArray.find(
    (element) => element.squareId === destinationSquareId
  );
  let pieceColor = currentSquare.pieceColor;
  let pieceType = currentSquare.pieceType;
  let pieceId= currentSquare.pieceId;
  destinationSquareElement.pieceColor = pieceColor;
  destinationSquareElement.pieceType = pieceType;
  destinationSquareElement.pieceId=pieceId;
  currentSquare.pieceColor = "blank";
  currentSquare.pieceType = "blank";
  currentSquare.pieceId = "blank";
}

function deepCopyArray(array){
  let arrayCopy=array.map(element=>{
    return {...element}
  });
  return arrayCopy;
}
setupBoardSquares();
setupPieces();
fillBoardSquaresArray();

function setupBoardSquares() {
  for (let i = 0; i < boardSquares.length; i++) {
    boardSquares[i].addEventListener("dragover", allowDrop);
    boardSquares[i].addEventListener("drop", drop);
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    let square = boardSquares[i];
    square.id = column + row;
  }
}
function setupPieces() {
  for (let i = 0; i < pieces.length; i++) {
    pieces[i].addEventListener("dragstart", drag);
    pieces[i].setAttribute("draggable", true);
    pieces[i].id =
      pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
  }
  for (let i = 0; i < piecesImages.length; i++) {
    piecesImages[i].setAttribute("draggable", false);
  }
}
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  const piece = ev.target;
  const pieceColor = piece.getAttribute("color");
  const pieceType = piece.classList[1];
  const pieceId=piece.id;
  if (
    (isWhiteTurn && pieceColor == "white") ||
    (!isWhiteTurn && pieceColor == "black")
  ) {
    const startingSquareId = piece.parentNode.id;
    ev.dataTransfer.setData("text", piece.id+"|"+startingSquareId);
    const pieceObject={pieceColor:pieceColor,pieceType:pieceType,pieceId:pieceId}
    let legalSquares= getPossibleMoves(startingSquareId, pieceObject,boardSquaresArray);
    let legalSquaresJson=JSON.stringify(legalSquares);
    ev.dataTransfer.setData("application/json",legalSquaresJson );

  } 
}

function drop(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  let [pieceId, startingSquareId] = data.split("|");
  let legalSquaresJson = ev.dataTransfer.getData("application/json");
  if (legalSquaresJson.length==0) return;
  let legalSquares = JSON.parse(legalSquaresJson);

  const piece = document.getElementById(pieceId);
  const pieceColor = piece.getAttribute("color");
  const pieceType = piece.classList[1];
  
  const destinationSquare = ev.currentTarget;
  let   destinationSquareId = destinationSquare.id;

  legalSquares=isMoveValidAgainstCheck(legalSquares,startingSquareId,pieceColor,pieceType);

  if (pieceType == "king") {
    let isCheck = isKingInCheck(
      destinationSquareId,
      pieceColor,
      boardSquaresArray
    );
    if (isCheck) return;
    isWhiteTurn  ? (whiteKingSquare=destinationSquareId) : (blackKingSquare=destinationSquareId);
  }

    let squareContent=getPieceAtSquare(destinationSquareId,boardSquaresArray);
  if (
     squareContent.pieceColor == "blank" &&
     legalSquares.includes(destinationSquareId)
  ) {
    destinationSquare.appendChild(piece);
    isWhiteTurn = !isWhiteTurn;
    updateBoardSquaresArray(
      startingSquareId,
      destinationSquareId,
      boardSquaresArray
    );
    checkForCheckmate();
    return;
  }
  if (
     squareContent.pieceColor!= "blank" &&
     legalSquares.includes(destinationSquareId)
  ) {
    let children = destinationSquare.children;
    for (let i = 0; i < children.length; i++) {
        if (!children[i].classList.contains('coordinate')) {
          destinationSquare.removeChild(children[i]);
        }
    }
    // while (destinationSquare.firstChild) {
    //   destinationSquare.removeChild(destinationSquare.firstChild);
    // }
    destinationSquare.appendChild(piece);
    isWhiteTurn = !isWhiteTurn;
    updateBoardSquaresArray(
      startingSquareId,
      destinationSquareId,
      boardSquaresArray
    );
    checkForCheckmate();
    return;
  }
}


function getPossibleMoves(startingSquareId, piece, boardSquaresArray) {
    const pieceColor = piece.pieceColor;
    const pieceType = piece.pieceType;
    let legalSquares = [];
    if (pieceType == "pawn") {
        legalSquares = getPawnMoves(startingSquareId, pieceColor,boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "knight") {
        legalSquares = getKnightMoves(startingSquareId, pieceColor,boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "rook") {
        legalSquares = getRookMoves(startingSquareId, pieceColor,boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "bishop") {
        legalSquares = getBishopMoves(startingSquareId, pieceColor,boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "queen") {
        legalSquares = getQueenMoves(startingSquareId, pieceColor,boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "king") 
        {
        legalSquares = getKingMoves(startingSquareId, pieceColor,boardSquaresArray);
        return legalSquares;
    }
}


function getPieceAtSquare(squareId, boardSquaresArray) {
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === squareId
    );
    const color = currentSquare.pieceColor;
    const pieceType = currentSquare.pieceType;
    const pieceId=currentSquare.pieceId;
    return { pieceColor: color, pieceType: pieceType,pieceId:pieceId};
  }

function getPawnMoves(startingSquareId, pieceColor, boardSquaresArray){
    let diagonalSquares = checkPawnDiagonalCaptures(startingSquareId, pieceColor, boardSquaresArray);
    let forwardSquares = checkPawnForwardMoves(startingSquareId, pieceColor, boardSquaresArray);
    let legalSquares = [ ... diagonalSquares, ... forwardSquares];

    return legalSquares;
}

function checkPawnDiagonalCaptures(startingSquareId, pieceColor, boardSquaresArray){
    const file=startingSquareId.charAt(0);
    const rank=startingSquareId.charAt(1);
    const rankNumber=parseInt(rank);
    let currentFile=file;
    let currentRank=rankNumber;
    let currentSquareId=currentFile+currentRank;

    let legalSquares = [];


    const direction=pieceColor=="white" ? 1:-1;
    currentRank+=direction;

    // check diagonal squares
    for(let i = -1; i <= 1; i+=2){
        currentFile=String.fromCharCode(file.charCodeAt()+i);
        if(currentFile >= "a" && currentFile <= "h") {

            currentSquareId=currentFile+currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId === currentSquareId);
            const squareContent = currentSquare.pieceColor;

            if(squareContent !="blank" && squareContent!=pieceColor){
                legalSquares.push(currentSquareId);
            }
        }
    }
    return legalSquares;
}

function checkPawnForwardMoves(startingSquareId, pieceColor, boardSquaresArray){
    const file=startingSquareId.charAt(0);
    const rank=startingSquareId.charAt(1);
    const rankNumber=parseInt(rank);

    let currentFile=file;
    let currentRank=rankNumber;
    let currentSquareId=currentFile+currentRank;
    let legalSquares = [];
    const direction = pieceColor == "white" ? 1:-1;

    currentRank += direction;
    currentSquareId = currentFile + currentRank;
    let currentSquare = boardSquaresArray.find((element)=>element.squareId === currentSquareId);
    let squareContent = currentSquare.pieceColor;

    if(squareContent != "blank") 
        return legalSquares;

    legalSquares.push(currentSquareId);

    if(rankNumber!=2 && rankNumber != 7) 
        return legalSquares;
    
    currentRank+=direction;
    currentSquareId=currentFile+currentRank;

    currentSquare = boardSquaresArray.find((element)=>element.squareId === currentSquareId);
    squareContent = currentSquare.pieceColor;
    

    if(squareContent != "blank")
        return legalSquares;
    legalSquares.push(currentSquareId);

    return legalSquares;
}

function getKnightMoves(startingSquareId, pieceColor, boardSquaresArray){
    const file = startingSquareId.charCodeAt(0)-97;
    const rank = startingSquareId.charAt(1);
    const rankNumber = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNumber;
    let legalSquares = [];
    const moves = [
        [-2,1], [-1,2], [1,2], [2,1], [2,-1], [1,-2], [-1, -2], [-2, -1]
    ];

    moves.forEach((move) => {
        currentFile = file + move[0];
        currentRank = rankNumber + move[1];
        if(currentFile >= 0 && currentFile <= 7 && currentRank > 0 && currentRank <=8){
            let currentSquareId = String.fromCharCode(currentFile+97) + currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId === currentSquareId);
            let squareContent = currentSquare.pieceColor;
            if(squareContent != "blank" && squareContent == pieceColor)
                return legalSquares;
            legalSquares.push(String.fromCharCode(currentFile+97)+currentRank);
        }
    });
    return legalSquares;
}

function getRookMoves(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charCodeAt(0) - 97; // Convert 'a'-'h' to 0-7
    const rankNumber = parseInt(startingSquareId.charAt(1)); // 1-8
    let legalSquares = [];
    
    const directions = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
    ];

    // use a forEach loop is important because break wont work

    directions.forEach((direction) => {
        // set to the roots origin
        let currentFile = file;
        let currentRank = rankNumber;
        // for each direction from the origin
        while(true) {
            currentFile += direction[0];
            currentRank += direction[1];
            if (currentFile < 0 || currentFile > 7 || currentRank < 1 || currentRank > 8) break;

            const currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId === currentSquareId);
            let squareContent = currentSquare.pieceColor;

            // if this is a buddy do not add the square
            if (squareContent == pieceColor) break;
            legalSquares.push(currentSquareId);

            //if there is someone here and they are not a buddy
            if (squareContent != "blank") break;
        }
    });

    return legalSquares;
}

function getBishopMoves(startingSquareId, pieceColor, boardSquaresArray){
    const file = startingSquareId.charCodeAt(0) - 97; // Convert 'a'-'h' to 0-7
    const rankNumber = parseInt(startingSquareId.charAt(1)); // 1-8

    const diagonals = [
        [1,1],
        [1,-1],
        [-1,1],
        [-1,-1],
    ];
    let legalSquares = [];

    // for each direction
    diagonals.forEach((diagonal) => {
        // origin of piece
        let currentFile = file;
        let currentRank = rankNumber;
        while(true){

            currentFile += diagonal[0];
            currentRank += diagonal[1];
            if (currentFile < 0 || currentFile > 7 || currentRank < 1 || currentRank > 8) break;
            const currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId === currentSquareId);
            let squareContent = currentSquare.pieceColor;

            // if this is a buddy do not add the square
            if(squareContent == pieceColor)
                break;
            legalSquares.push(currentSquareId);
            
            //if there is someone here and they are not a buddy
            if(squareContent != "blank") 
                break;
        }

    });
    return legalSquares;
}



function getQueenMoves(startingSquareId, pieceColor, boardSquaresArray) {
    let bishopSquares = getBishopMoves(startingSquareId, pieceColor, boardSquaresArray);
    let rookSquares = getRookMoves(startingSquareId, pieceColor, boardSquaresArray);
    let legalSquares = [ ... bishopSquares, ... rookSquares];

    return legalSquares;
}

function getKingMoves(startingSquareId, pieceColor, boardSquaresArray) {
    const file = startingSquareId.charCodeAt(0) - 97; // Convert 'a'-'h' to 0-7
    const rankNumber = parseInt(startingSquareId.charAt(1)); // 1-8
    let legalSquares = [];
    const allDirections = [
        [1,0],
        [-1,0],
        [0,1],
        [0,-1],
        [1,1],
        [1,-1],
        [-1,1],
        [-1,-1],
    ];

    for( let i = 0; i < 8; i++) {
        let currentFile = file;
        let currentRank = rankNumber;

        currentFile += allDirections[i][0];
        currentRank += allDirections[i][1];

        if(currentFile < 0 || currentFile > 7  || currentRank < 1 || currentRank > 8) {
            continue;
        }
        const currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
        let currentSquare = boardSquaresArray.find((element)=>element.squareId === currentSquareId);
        let squareContent = currentSquare.pieceColor;

        if(squareContent == pieceColor)
            continue;
        legalSquares.push(currentSquareId);

        if(squareContent != "blank") 
            continue;
    }

    return legalSquares;
}

// instead of checking the positions of the opposing pieces and seeing if they attack the king
// see, from the POV of the king, if anything is attacking it
function isKingInCheck(squareId,pieceColor,boardSquaresArray) {
  let legalSquares=getRookMoves(squareId,pieceColor,boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId,boardSquaresArray);
    if(
      (pieceProperties.pieceType=="rook" ||
      pieceProperties.pieceType=="queen") &&
      pieceColor!=pieceProperties.pieceColor
    ) return true;
  }
  legalSquares=getBishopMoves(squareId,pieceColor,boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId,boardSquaresArray);
    if(
      (pieceProperties.pieceType=="bishop" ||
      pieceProperties.pieceType=="queen") &&
      pieceColor!=pieceProperties.pieceColor
    ) return true;
  }
   legalSquares=checkPawnDiagonalCaptures(squareId,pieceColor,boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId,boardSquaresArray);
    if(
      (pieceProperties.pieceType=="pawn") &&
      pieceColor!=pieceProperties.pieceColor
    ) return true;
  }
  legalSquares=getKnightMoves(squareId,pieceColor,boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId,boardSquaresArray);
    if(
      (pieceProperties.pieceType=="knight") &&
      pieceColor!=pieceProperties.pieceColor
    ) return true;
  }
  legalSquares=getKingMoves(squareId,pieceColor,boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId,boardSquaresArray);
    if(
      (pieceProperties.pieceType=="king") &&
      pieceColor!=pieceProperties.pieceColor
    ) return true;
  }
  return false;
}


function isMoveValidAgainstCheck(legalSquares, startingSquareId, pieceColor, pieceType) {
  let kingSquare = isWhiteTurn ? whiteKingSquare: blackKingSquare;
  let boardSquaresArrayCopy = deepCopyArray(boardSquaresArray);
  let legalSquaresCopy = legalSquares.slice();
  legalSquaresCopy.forEach((element) => {
      let destinationId = element;
      boardSquaresArrayCopy = deepCopyArray(boardSquaresArray);
      updateBoardSquaresArray(startingSquareId, destinationId, boardSquaresArrayCopy);
      if(pieceType != "king" && isKingInCheck (kingSquare, pieceColor, boardSquaresArrayCopy)) {
          legalSquares = legalSquares.filter((item)=>item != destinationId);
      }
      if(pieceType == "king" && isKingInCheck (destinationId, pieceColor, boardSquaresArrayCopy)) {
          legalSquares = legalSquares.filter((item)=>item != destinationId);
      }
  })
  return legalSquares;
}

function checkForCheckmate() {
  let kingSquare = isWhiteTurn ? whiteKingSquare : blackKingSquare;
  let pieceColor = isWhiteTurn ? "white" : "black";
  let boardSquaresArrayCopy = deepCopyArray(boardSquaresArray);
  let kingIsCheck=isKingInCheck(kingSquare, pieceColor, boardSquaresArrayCopy);
  if(!kingIsCheck) return;
  let possibleMoves = getAllPossibleMoves(boardSquaresArrayCopy, pieceColor);
  if(possibleMoves.length > 0) return;
  let message = "";
  isWhiteTurn ? (message = "Black Wins!") : (message = "White Wins!");
  showAlert(message);
}

function getAllPossibleMoves(squaresArray, color) {
  return squaresArray
  .filter((square)=>square.pieceColor ===color)
  .flatMap((square)=> {
      const {pieceColor, pieceType, pieceId} = getPieceAtSquare(square.squareId, squaresArray);
      if(pieceId ==="blank") return [];
      let squaresArrayCopy = deepCopyArray(squaresArray);
      const pieceObject = {pieceColor: pieceColor, pieceType: pieceType, pieceId:pieceId};
      let legalSquares = getPossibleMoves(square.squareId, pieceObject, squaresArrayCopy);
      legalSquares = isMoveValidAgainstCheck(legalSquares, square.squareId, pieceColor, pieceType);
      return legalSquares;
  })
}

function showAlert(message) {
  const alert= document.getElementById("alert");
  alert.innerHTML=message;
  alert.style.display="block";

  setTimeout(function(){
     alert.style.display="none";
  },3000);
}