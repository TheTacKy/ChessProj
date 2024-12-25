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

function getPossibleMoves(startingSquareId, piece){
    
    const pieceColor=piece.getAttribute("color");
    if(piece.classList.contains("pawn")){
        getPawnMoves(startingSquareId, pieceColor);
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