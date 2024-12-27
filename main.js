let boardSquaresArray = [];

let legalSquares=[];
let isWhiteTurn = true;
const boardSquares=document.getElementsByClassName("square");
const pieces=document.getElementsByClassName("piece");
const piecesImages=document.getElementsByTagName("img");

setupBoardSquares();
setupPieces();
fillBoardSquaresArray();

function fillBoardSquaresArray(){
    const boardSquares = document.getElementsByClassName("square");

    for(let i = 0; i < boardSquares.length; i++){
        let row = 8 - Math.floor(i/8);
        let column = String.fromCharCode(97+(i%8));
        let square = boardSquares[i];
        square.id = column + row;
        let color = ""
        let pieceType = ""
        let pieceId = ""

        if(square.querySelector(".piece")) {   
            color = square.querySelector(".piece").getAttribute("color");
            pieceType = square.querySelector(".piece").classList[1];
            pieceId = square.querySelector("piece").id;
        } else {
            color = "blank";
            pieceType="blank";
            pieceId="blank";
        }
        let arrayElement = {
            squareId: square.id,
            pieceColor: color,
            pieceType: pieceType,
            pieceId: pieceId
        };

        boardSquaresArray.push(arrayElement);
    }
}

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
    const pieceType = piece.classList[1];
    const pieceId = piece.id;
    if((isWhiteTurn && pieceColor=="white") || (!isWhiteTurn && pieceColor=="black")){
        ev.dataTransfer.setData("text", piece.id+"|"+startingSquareId);
        const pieceObject = {pieceColor:pieceColor, pieceType:pieceType, pieceId: pieceId}
        let legalSquares = getPossibleMoves(startingSquareId, pieceObject, boardSquaresArray);
        let legalSquaresJson = JSON.stringify(legalSquares);
        ev.dataTransfer.setData("application/json", legalSquaresJson);
    }
}

function drop(ev){
    ev.preventDefault();
    let data=ev.dataTransfer.getData("text");
    let [pieceId, startingSquareId] = data.split();
    let legalSquaresJson = ev.dataTransfer.getData("application/json");
    if(legalSquaresJson.length == 0)
        return;
    let legalSquares = JSON.parse(legalSquaresJson);

    const piece = document.getElementById(pieceId);
    const pieceColor = piece.getAttribute("color");
    const pieceType = piece.classList[1];
    const destinationSquare = ev.currentTarget;
    let destinationSquareId = destinationSquare.id;
    let squareContent = getPieceAtSquare(destinationSquareId, boardSquaresArray);

    if((squareContent.pieceColor == "blank") && (legalSquares.includes(destinationSquareId)) ){
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

function getPossibleMoves(startingSquareId, piece, boardSquaresArray) {
    const pieceColor = piece.pieceColor;
    const pieceType = piece.pieceType;
    let legalSquares = [];
    if (pieceType == "pawn") {
        legalSquares = getPawnMoves(startingSquareId, piece, boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "knight") {
        legalSquares = getKnightMoves(startingSquareId, piece, boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "rook") {
        legalSquares = getRookMoves(startingSquareId, piece, boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "bishop") {
        legalSquares = getBishopMoves(startingSquareId, piece, boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "queen") {
        legalSquares = (startingSquareId, piece, boardSquaresArray);
        return legalSquares;
    } else if (pieceType == "king") 
        {
        getKingMoves(startingSquareId, piece, boardSquaresArray);
        return legalSquares;
    }
}


function isSquareOccupied(squareId, boardSquaresArray){
    let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
    const color = currentSquare.pieceColor;
    const pieceType = currentSquare.pieceType;
    const pieceId = currentSquarelpieceId;
    return {pieceColor:color, pieceType:pieceType, pieceId:pieceId}
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

    // let currentSquare=document.getElementById(currentSquareId);
    // let squareContent=isSquareOccupied(currentSquare);

    const direction=pieceColor=="white" ? 1:-1;
    currentRank+=direction;

    // check diagonal squares
    for(let i = -1; i <= 1; i+=2){
        currentFile=String.fromCharCode(file.charCodeAt()+i);
        if(currentFile >= "a" && currentFile <= "h") {

            currentSquareId=currentFile+currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
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
    let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
    let squareContent = currentSquare.pieceColor;

    if(squareContent != "blank") 
        return legalSquares;

    legalSquares.push(currentSquareId);

    if(rankNumber!=2 && rankNumber != 7) 
        return legalSquares;
    
    currentRank+=direction;
    currentSquareId=currentFile+currentRank;

    currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
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
    let legalMoves = [];
    const moves = [
        [-2,1], [-1,2], [1,2], [2,1], [2,-1], [1,-2], [-1, -2], [-2, -1]
    ];

    moves.forEach((move) => {
        currentFile = file + move[0];
        currentRank = rankNumber + move[1];
        if(currentFile >= 0 && currentFile <= 7 && currentRank > 0 && currentRank <=8){
            let currentSquareId = String.fromCharCode(currentFile+97) + currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
            let squareContent = currentSquare.pieceColor;
            if(squareContent != "blank" && squareContent == pieceColor)
                return legalSquares;
            legalSquares.push(String.fromCharCode(currentFile+97)+currentRank);
        }
    });
    return legalMoves;
}

function getRookMoves(startingSquareId, pieceColor, boardSquaresArray) {
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
            let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
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

    // for each direction
    diagonals.forEach((diagonal) => {
        // origin of piece
        let currentFile = file;
        let currentRank = rankNumber;
        legalSquares = [];
        while(true){

            currentFile += diagonal[0];
            currentRank += diagonal[1];
            if (currentFile < 0 || currentFile > 7 || currentRank < 1 || currentRank > 8) break;
            const currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
            let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
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
        let currentSquare = boardSquaresArray.find((element)=>element.squareId == squareId);
        let squareContent = currentSquare.pieceColor;

        if(squareContent == pieceColor)
            continue;
        legalSquares.push(currentSquareId);

        if(squareContent != "blank") 
            continue;
    }

    return legalSquares;
}

