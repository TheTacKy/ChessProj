let legalSquares=[];
let isWhiteTurn = true;
const boardSquares=document.getElementsByClassName("square");
const pieces=document.getElementsByClassName("piece");
const piecesImages=document.getElementsByTagName("img");

setupBoardSquares();
setupPieces();

function setupBoardSquares(){
    for(let i = 0; i < boardSquares.length; i++){
        boardSquares[i].addEventListener("dragover", allowDrop);
        boardSquares[i].addEventListener("drop", drop);
        let row = 8-Math.floor(i/8);
        let column=String.fromCharCode(97+(i%8));
        boardSquares[i].id = column + row;
    }
}

function setupPieces(){
    for(let i = 0; i < pieces.length; i++){
        pieces[i].addEventListener("dragstart", drag);
        pieces[i].setAttribute("draggable", true);
        pieces[i].id=pieces[i].className.split(" ")[1]+pieces[i].parentElement.id;
    }
    for(let i = 0; i < piecesImages.length; i++){
        piecesImages[i].setAttribute("draggable", false);
    }
}

function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev){
    const piece=ev.target;
    const pieceColor=piece.getAttribute("color");
    if((isWhiteTurn && pieceColor=="white") || (!isWhiteTurn && pieceColor=="black")){
        ev.dataTransfer.setData("text", piece.id);
        const startingSquareId = piece.parentNode.id
        getPossibleMoves(startingSquareId, piece);
    }
}

function drop(ev){
    ev.preventDefault();
    let data=ev.dataTransfer.getData("text");
    const piece=document.getElementById(data);
    const destinationSquare=ev.currentTarget;
    let destinationSquareId=destinationSquare.id;
    if((isSquareOccupied(destinationSquare) == "blank") && (legalSquares.includes(destinationSquareId)) ){
        destinationSquare.appendChild(piece);
        isWhiteTurn=!isWhiteTurn;
        legalSquares.length=0;
        return;
    }
    if(isSquareOccupied(destinationSquare) != "blank" && (legalSquares.includes(destinationSquareId))){
        while(destinationSquare.firstChild){
            destinationSquare.removeChild(destinationSquare.firstChild);
        }
        destinationSquare.appendChild(piece);
        isWhiteTurn=!isWhiteTurn;
        legalSquares.length=0;
        return;
    }
    
}

function getPossibleMoves(startingSquareId, piece) {
    const pieceColor = piece.getAttribute("color");

    if (piece.classList.contains("pawn")) {
        getPawnMoves(startingSquareId, pieceColor);
    } else if (piece.classList.contains("knight")) {
        getKnightMoves(startingSquareId, pieceColor);
    } else if (piece.classList.contains("rook")) {
        getRookMoves(startingSquareId, pieceColor);
    } else if (piece.classList.contains("bishop")) {
        getBishopMoves(startingSquareId, pieceColor);
    } else if (piece.classList.contains("queen")) {
        getRookMoves(startingSquareId, pieceColor);
        getBishopMoves(startingSquareId, pieceColor);
    }
}


function isSquareOccupied(square){
    if(square.querySelector(".piece")){
        const color = square.querySelector(".piece").getAttribute("color");
        return color;
    } else {
        return "blank";
    }
}

function getPawnMoves(startingSquareId, pieceColor){
    checkPawnDiagonalCaptures(startingSquareId, pieceColor);
    checkPawnForwardMoves(startingSquareId, pieceColor);
}

function checkPawnDiagonalCaptures(startingSquareId, pieceColor){
    const file=startingSquareId.charAt(0);
    const rank=startingSquareId.charAt(1);
    const rankNumber=parseInt(rank);
    let currentFile=file;
    let currentRank=rankNumber;
    let currentSquareId=currentFile+currentRank;
    let currentSquare=document.getElementById(currentSquareId);
    let squareContent=isSquareOccupied(currentSquare);

    const direction=pieceColor=="white" ? 1:-1;
    currentRank+=direction;

    // check diagonal squares
    for(let i = -1; i <= 1; i+=2){
        currentFile=String.fromCharCode(file.charCodeAt()+i);
        if(currentFile >= "a" && currentFile <= "h") {
            currentSquareId=currentFile+currentRank;
            currentSquare=document.getElementById(currentSquareId);
            squareContent=isSquareOccupied(currentSquare);
            if(squareContent !="blank" && squareContent!=pieceColor){
                legalSquares.push(currentSquareId);
            }
        }
    }
}

function checkPawnForwardMoves(startingSquareId, pieceColor){
    const file=startingSquareId.charAt(0);
    const rank=startingSquareId.charAt(1);
    const rankNumber=parseInt(rank);

    let currentFile=file;
    let currentRank=rankNumber;
    let currentSquareId=currentFile+currentRank;
    let currentSquare=document.getElementById(currentSquareId);
    let squareContent=isSquareOccupied(currentSquare);
    const direction = pieceColor == "white" ? 1:-1;

    currentRank += direction;
    currentSquareId = currentFile + currentRank;
    currentSquare=document.getElementById(currentSquareId);
    squareContent=isSquareOccupied(currentSquare);
    if(squareContent != "blank") 
        return;

    legalSquares.push(currentSquareId);

    if(rankNumber!=2 && rankNumber != 7) 
        return;
    
    currentRank+=direction;
    currentSquareId=currentFile+currentRank;
    currentSquare=document.getElementById(currentSquareId);
    squareContent=isSquareOccupied(currentSquare);
    

    if(squareContent != "blank")
        return;
    legalSquares.push(currentSquareId);
}

function getKnightMoves(startingSquareId, pieceColor){
    const file = startingSquareId.charCodeAt(0)-97;
    const rank = startingSquareId.charAt(1);
    const rankNumber = parseInt(rank);
    let currentFile = file;
    let currentRank = rankNumber;

    const moves = [
        [-2,1], [-1,2], [1,2], [2,1], [2,-1], [1,-2], [-1, -2], [-2, -1]
    ];

    moves.forEach((move) => {
        currentFile = file + move[0];
        currentRank = rankNumber + move[1];
        if(currentFile >= 0 && currentFile <= 7 && currentRank > 0 && currentRank <=8){
            let currentSquareId = String.fromCharCode(currentFile+97) + currentRank;
            let currentSquare = document.getElementById(currentSquareId);
            let squareContent = isSquareOccupied(currentSquare);
            if(squareContent != "blank" && squareContent == pieceColor)
                return;
            legalSquares.push(String.fromCharCode(currentFile+97)+currentRank);
        }
    });
}

function getRookMoves(startingSquareId, pieceColor) {
    const file = startingSquareId.charCodeAt(0) - 97; // Convert 'a'-'h' to 0-7
    const rankNumber = parseInt(startingSquareId.charAt(1)); // 1-8

    
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
            const currentSquare = document.getElementById(currentSquareId);
            const squareContent = isSquareOccupied(currentSquare);

            // if this is a buddy do not add the square
            if (squareContent == pieceColor) break;
            legalSquares.push(currentSquareId);

            //if there is someone here and they are not a buddy
            if (squareContent != "blank") break;
        }
    });
}

function getBishopMoves(startingSquareId, pieceColor){
    const file = startingSquareId.charCodeAt(0) - 97; // Convert 'a'-'h' to 0-7
    const rankNumber = parseInt(startingSquareId.charAt(1)); // 1-8

    const diagonals = [
        [1,1],
        [1,-1],
        [-1,1],
        [-1,-1],
    ];

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
            const currentSquare = document.getElementById(currentSquareId);
            const squareContent = isSquareOccupied(currentSquare);

            // if this is a buddy do not add the square
            if(squareContent == pieceColor)
                break;
            legalSquares.push(currentSquareId);
            
            //if there is someone here and they are not a buddy
            if(squareContent != "blank") 
                break;

        }

    });
}
