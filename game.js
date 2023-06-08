$ (document).ready(function() {

    var vsComp; // check if playing against computer; set to false if two humans are playing
    var player1; // x or o
    var player2; // x or o
    var activePlayer; // player1 or player2
    var compPlayer; // always player2 in 1-player vs. computer games (human is always player1)
    var compMove; // used in computerTurn to generate the computer's move that turn
  
    // positions of plays to determine win matches
    var p1pos = [];
    var p2pos = [];
  
    // array of box posiations to use with indexOf
    var boxpos = ['box0', 'box1', 'box2', 'box3', 'box4', 'box5', 'box6', 'box7', 'box8'];
  
    // list of unused moves; end game when no moves are left
    var remaining = ['box0', 'box1', 'box2', 'box3', 'box4', 'box5', 'box6', 'box7', 'box8'];
  
    // possible winning move combinations
    var winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
  
    // custom x and o cursors
    var cursors = {
      'x': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAYagMeiWXwAAAHJJREFUeNqtU1sKwDAIS2T3v7L7WB3OqXQ4oR/FPBqlVFWFK5JEUxF/LNIDUImsnr9DIojkyyUjW0nmFEUqMgCwA5hG1aPP2rlU5PsFX0Q8uVtTerLhCoY1jvDPEEdr7Mjm0mFkK+dllMaR3T1XIpx+5xPS6YL9mHPHegAAAABJRU5ErkJggg==',
      'o': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAYagMeiWXwAAAHNJREFUeNrNk8EOgCAMQ1vD//9yPWGwdIkoB3cc9G2UjQghSSlPklOuEvrdkTmC6OJQJII6hCviBGlPWvZzktd5S4ZJmgyTpFBEh9OTuLdrRgIADnyMnwD8bYWxcq9uc7DyjaPZzRKloBzrLaO8ZZnervMJ9+tkGnJK5yUAAAAASUVORK5CYII='
    };
  
    // trigger modal once on load
    $(window).one('load', showModal("vsCompPrompt"));
  
    // set vsComp based on modal input
    $('.vsComp-btn').click(function() {
      if ($(this).attr('id') == 'comp') {
        vsComp = true;
        showModal("playerPrompt"); // player choice only necessary against computer
      } else if ($(this).attr('id') == 'human') {
        vsComp = false;
        player1 = 'x';
        player2 = 'o';
        activePlayer = player1;
        // display whose turn it is at start (2-player vs. friend)
        $('#whoseTurnP').html("It's <span class='" + activePlayer + "'>" + activePlayer + "</span>'s turn.");
      }
    })
  
    // assign players to x and o based on modal input (1-player vs. computer)
    $('.player-btn').click(function() {
      if ($(this).attr('id') == 'x') {
        player1 = 'x';
        player2 = 'o';
        compPlayer = player2;
        activePlayer = player1;
      } else if ($(this).attr('id') == 'o') {
        player1 = 'o';
        player2 = 'x';
        compPlayer = player2;
        activePlayer = player2;
        computerTurn();
      }
      // display whose turn it is at start (1-player vs. computer)
      $('#whoseTurnP').html("It's <span class='" + activePlayer + "'>" + activePlayer + "</span>'s turn.");
    })
  
    // set correct cursor prior to first move
    $('.board').mouseenter(function() {
      $('.square').css('cursor', 'url(' + cursors[activePlayer] + '), pointer');
    });
  
    // logic when player takes a turn; assume computer is always player2
    $('.square').click(function() {
      // make sure a move hasn't already been made on this square
      if (!$(this).find('span').hasClass(player1) && !$(this).find('span').hasClass(player2)) {
        // check which player is acting
        if (activePlayer == player1) {
          // mark class to 'claim' the spot, and fill in the spot with the corresponding symbol
          $(this).find('span').addClass(player1).html(player1);
          // log the position of the spot
          p1pos.push(boxpos.indexOf($(this).attr("id")));
          // remove box from array of remaining available spots
          deleteMove($(this).attr("id"), remaining);
          // surrender turn to other player, if no win/draw
          activePlayer = player2;
          // change cursor to other symbol
          $('.square').css('cursor', 'url(' + cursors[activePlayer] + '), pointer');
          // check if a win has occurred before fully surrendering the turn
          if (checkWinArrs(p1pos)) {
            activePlayer = player1; // winning player gets to go first on next play
            // have whoseTurn show winner as turn-taker
            $('#whoseTurnP').html("It's <span class='" + activePlayer + "'>" + activePlayer + "</span>'s turn.");
            $('#resultsP').html("Player <span class='" + activePlayer + "'>" + activePlayer + "</span> wins! (Winner goes first next round.)");
            showModal("resultsDisplay");
          } else if (remaining.length == 0) { // check if a draw has occurred
            $('#resultsP').html("It's a draw! (Pass the turn next round.)");
            showModal("resultsDisplay");
          } else if (vsComp == true && activePlayer == compPlayer) {
            computerTurn();
          };
          // same logic for other player
        } else if (activePlayer == player2) {
          $(this).find('span').addClass(player2).html(player2);
          p2pos.push(boxpos.indexOf($(this).attr("id")));
          deleteMove($(this).attr("id"), remaining);
          activePlayer = player1;
          $('.square').css('cursor', 'url(' + cursors[activePlayer] + '), pointer');
          if (checkWinArrs(p2pos)) {
            activePlayer = player2; // winning player gets to go first on next play
            // have whoseTurn show winner as turn-taker
            $('#whoseTurnP').html("It's <span class='" + activePlayer + "'>" + activePlayer + "</span>'s turn.");
            $('#resultsP').html("Player <span class='" + activePlayer + "'>" + activePlayer + "</span> wins! (Winner goes first next round.)");
            showModal("resultsDisplay");
          } else if (remaining.length == 0) { // check if a draw has occurred
            $('#resultsP').html("It's a draw! (Pass the turn next round.)");
            showModal("resultsDisplay");
          }
        }
      }
      // change displayed turn-taker as turn moves to other player
      $('#whoseTurnP').html("It's <span class='" + activePlayer + "'>" + activePlayer + "</span>'s turn.");
    })
  
    // remove boxes from remaining as moves are taken
    function deleteMove(box, arr) {
      var index = arr.indexOf(box);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }
  
    // slightly delay computer move to better resemble actual player
    function computerTurn() {
      $('.board').addClass('no-click');
      t = window.setTimeout(computerTurnFunc, 350);
    }
  
    // computer player takes its turn
    function computerTurnFunc() {
      compAI1();
      $("#" + compMove).trigger("click");
      $('.board').removeClass('no-click');
    };
    function refreshPage() {
        location.reload(); // Reloads the current page
    }
  
    // checks for win opportunities the computer can make
    function compAI1() {
      // cycle through each winning combination arrays
      for (var i = 0; i < winningCombos.length; i++) {
        var count = 0;
        var missing = -1;
        var found = false;
        // cycle through each position in a given winning combination array
        for (var j = 0; j < winningCombos[i].length; j++) {
          if ($.inArray(winningCombos[i][j], p2pos) >= 0) {
            count += 1;
          } else {
            missing = winningCombos[i][j];
          }
          // verify 1) that 2 of the 3 winning spots are filled (count = 2)
          // 2) that the missings spot has been identified (missing > -1)
          // and 3) that the missing spot is still free (by checking remaining)
          if (count == 2 && missing >= 0 && ($.inArray(boxpos[missing], remaining) >= 0)) {
            found = true;
            compMove = boxpos[missing];
            return compMove;
          }
        }
        if (found == false) {
          compAI2();
        }
      }
    }
  
    // checks for opponent win opportunities the computer can block
    function compAI2() {
      // cycle through each winning combination arrays
      for (var i = 0; i < winningCombos.length; i++) {
        var count = 0;
        var missing = -1;
        var found = false;
        // cycle through each position in a given winning combination array
        for (var j = 0; j < winningCombos[i].length; j++) {
          if ($.inArray(winningCombos[i][j], p1pos) >= 0) {
            count += 1;
          } else {
            missing = winningCombos[i][j];
          }
          console.log("ok so far...");
          // verify 1) that 2 of the 3 winning spots are filled (count = 2)
          // 2) that the missings spot has been identified (missing > -1)
          // and 3) that the missing spot is still free (by checking remaining)
          if (count == 2 && missing >= 0 && ($.inArray(boxpos[missing], remaining) >= 0)) {
            found = true;
            compMove = boxpos[missing];
            return compMove;
          }
        }
        if (found == false) {
          compAI3();
        }
      }
    }
  
    function compAI3() {
      // found that starting on center box4 made AI too difficult
      // so we'll randomize the chance that AI will choose center box4
      // 1 in 3 chance of center box4
      var randNums = [0, 1, 2];
      var randomize = randNums[Math.floor(Math.random() * randNums.length)];
      // for 50% chance: var randomize = Math.round(Math.random()*2);
      // if no win/block options, take center box if free (depending on randomize)
      if (($.inArray("box4", remaining) >= 0) && randomize == 0) {
        compMove = "box4";
      } else {
        // otherwise, pick a random spot from the remaining spots
        compMove = remaining[Math.floor(Math.random() * remaining.length)];
      }
    }
  
    // check if one winning array matches the player's move array
    function checkWin(playerArr, winArr) {
      return winArr.every(function(val) {
        return playerArr.indexOf(val) >= 0;
      });
    }
  
    // use checkWin to check player's move array against all winning arrays
    function checkWinArrs(playerArr) {
      for (i = 0; i < winningCombos.length; i++) {
        // pass true only if there is a match
        if (checkWin(playerArr, winningCombos[i])) {
          return checkWin(playerArr, winningCombos[i]);
        }
      }
    }
  
    // reset the board when a game completes/starts over
    function resetBoard() {
      $('.square').find('span').html('&nbsp;');
      $('.square').find('span').removeClass(player1);
      $('.square').find('span').removeClass(player2);
      remaining = boxpos.slice(0); // reset remaining positions array
      p1pos = [];
      p2pos = [];
      // change displayed turn
      $('#whoseTurnP').html("It's <span class='" + activePlayer + "'>" + activePlayer + "</span>'s turn.");
      // force reset cursor
      $('.square').css('cursor', 'url(' + cursors[activePlayer] + '), pointer');
      if (vsComp == true && activePlayer == compPlayer) {
        computerTurn();
      };
      $('.board').removeClass('no-click');
    }
  
    // always have "OK" button on results modal reset the board when clicked
    $('.ok-btn').click(function() {
      resetBoard();
    });
  
    // display modal
    function showModal(id) {
      $('#' + id).modal('show');
    }
  
  })