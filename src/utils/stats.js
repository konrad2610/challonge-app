function predicate() {
    var fields = [];
    var n_fields = arguments.length;
    var field;
    var name;
    var cmp;
  
    var default_cmp = function (a, b) {
        if (a === b) return 0;
        return a < b ? -1 : 1;
    };
    var getCmpFunc = function (primer, reverse) {
        var dfc = default_cmp;
        var cmp = default_cmp;
        if (primer) {
          cmp = function (a, b) {
            return dfc(primer(a), primer(b));
          };
        }
        if (reverse) {
          return function (a, b) {
            return -1 * cmp(a, b);
          };
        }
        return cmp;
    };
  
    // preprocess sorting options
    for (var i = 0; i < n_fields; i++) {
      field = arguments[i];
      if (typeof field === 'string') {
        name = field;
        cmp = default_cmp;
      } else {
        name = field.name;
        cmp = getCmpFunc(field.primer, field.reverse);
      }
      fields.push({
        name: name,
        cmp: cmp
      });
    }
  
    // final comparison function
    return function (A, B) {
      var name;
      var result;
  
      for (var i = 0; i < n_fields; i++) {
        result = 0;
        field = fields[i];
        name = field.name;
  
        result = field.cmp(A[name], B[name]);
        if (result !== 0) break;
      }
      return result;
    };
}

function roundNumber(num, scale) {
    if(!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale)  + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if(+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}

export const getMatchStats = (participantsWithMatchesList) => {
    if (typeof participantsWithMatchesList !== 'object') {
      return null;
    }

    const matchStats = participantsWithMatchesList.map((participantWithMatches, i) => {
      let wins = 0;
      let draws = 0;
      let loses = 0;
      let completed = 0;
      let open = 0;
      let setWon = 0;
      let setLoses = 0;
      let pointsLoses = 0;
      let pointsWon = 0;
      let wins2to1 = 0;
      let loses1to2 = 0;

      participantWithMatches.matches.forEach((match, i) => {
        const actualMatch = match.match;
        if (actualMatch.state === 'complete') {
          completed += 1;
          let currentMatchSetWon = 0;
          let currentMatchSetLost = 0;
          
          const setsArray = actualMatch.scores_csv.split(',');

          setsArray.forEach((set, i) => {
            const setArray = set.split('-');

            if (actualMatch.player1_id === participantWithMatches.id) {
              pointsWon += Number(setArray[0]);
              pointsLoses += Number(setArray[1]);

              if (Number(setArray[0]) === 8) {
                setWon += 1;
                currentMatchSetWon += 1;
              }
              if (Number(setArray[1]) === 8) {
                setLoses += 1;
                currentMatchSetLost += 1;
              }

            } else {
              pointsWon += Number(setArray[1]);
              pointsLoses += Number(setArray[0]);

              if (Number(setArray[1]) === 8) {
                setWon += 1;
                currentMatchSetWon += 1;
              }
              if (Number(setArray[0]) === 8) {
                setLoses += 1;
                currentMatchSetLost += 1;
              }
            }
          });

          if (!actualMatch.winner_id) {
            draws += 1;
          } else if (actualMatch.winner_id === participantWithMatches.id) {
            wins += 1;

            if (currentMatchSetLost === 1) {
              wins2to1 += 1;
            }
          } else {
            loses += 1;

            if (currentMatchSetWon === 1) {
              loses1to2 += 1;
            }
          }
        } else if (actualMatch.state === 'open') {
          open += 1;
        }
      });

      return {
        name: participantWithMatches.name,
        id: participantWithMatches.id,
        wins,
        wins2to1,
        loses,
        loses1to2,
        draws,
        completed,
        completedWithoutDraws: completed - draws,
        completedWithoutDrawsString: `${completed - draws}/12`,
        open,
        all: completed + open,
        setLoses,
        setWon,
        pointsWon,
        pointsLoses,
        pointsDifference: pointsWon - pointsLoses,
        pointsRatio: roundNumber(pointsWon / pointsLoses, 3),
        winLoseMatch: `${wins} - ${loses}`,
        extendedWinLoseMatch: `${wins} (${wins2to1}) - ${loses} (${loses1to2})`,
        winLoseSet: `${setWon} - ${setLoses}`,
        winLosePoints: `${pointsWon} - ${pointsLoses}`,
        setPercent: `${roundNumber(100 * setWon / (setWon + setLoses), 2)}%`,
        setRatio: roundNumber(setWon / setLoses, 3)
      };
    });

    const sortedMatchStats = matchStats.sort(predicate(
      {name: 'wins', reverse: true}, 
      'loses', 
      {name: 'setRatio', reverse: true},
      {name: 'pointsDifference', reverse: true}
    ));
  
    return sortedMatchStats;
};

export const getIndividualStats = (individualPlayersList, sortedMatchStatsList) => {
    if (typeof sortedMatchStatsList !== 'object') {
      return null;
    }

    function splitString(str, splitIndex = Math.ceil(str.length / 2)) {
      return {
        first: str.slice(0, splitIndex),
        second: str.slice(splitIndex)
      };
    }

    const individualStats = individualPlayersList.map((individualPlayer, i) => {
      const individualPlayerName = splitString(individualPlayer, 2).first;
      let wins = 0;
      let wins2to1 = 0;
      let draws = 0;
      let loses = 0;
      let loses1to2 = 0;
      let completed = 0;
      let open = 0;
      let setWon = 0;
      let setLoses = 0;
      let pointsLoses = 0;
      let pointsWon = 0;

      sortedMatchStatsList.forEach((oneTeamMatchStats, i) => {
        const currentPlayersNames = splitString(oneTeamMatchStats.name);
        const firstPlayerName = currentPlayersNames.first;
        const secondPlayerName = currentPlayersNames.second;
        
        if (firstPlayerName === individualPlayerName || secondPlayerName === individualPlayerName) {
          wins += oneTeamMatchStats.wins;
          wins2to1 += oneTeamMatchStats.wins2to1;
          draws += oneTeamMatchStats.draws;
          loses += oneTeamMatchStats.loses;
          loses1to2 += oneTeamMatchStats.loses1to2;
          completed += oneTeamMatchStats.completed;
          open += oneTeamMatchStats.open;
          setWon += oneTeamMatchStats.setWon;
          setLoses += oneTeamMatchStats.setLoses;
          pointsLoses += oneTeamMatchStats.pointsLoses;
          pointsWon += oneTeamMatchStats.pointsWon;
        }

      });

      return {
        name: individualPlayer,
        wins,
        wins2to1,
        loses,
        loses1to2,
        draws,
        completed,
        completedWithoutDraws: completed - draws,
        completedWithoutDrawsString: `${completed - draws}/120`,
        open,
        all: completed + open,
        setLoses,
        setWon,
        pointsWon,
        pointsLoses,
        pointsDifference: pointsWon - pointsLoses,
        pointsRatio: roundNumber(pointsWon / pointsLoses, 3),
        winLoseMatch: `${wins} - ${loses}`,
        extendedWinLoseMatch: `${wins} (${wins2to1}) - ${loses} (${loses1to2})`,
        winLoseSet: `${setWon} - ${setLoses}`,
        winLosePoints: `${pointsWon} - ${pointsLoses}`,
        setPercent: `${roundNumber(100 * setWon / (setWon + setLoses), 2)}%`,
        setRatio: roundNumber(setWon / setLoses, 3)
      };
    });

    const sortedIndividualStats = individualStats.sort(predicate(
      {name: 'wins', reverse: true}, 
      'loses', 
      {name: 'setRatio', reverse: true},
      {name: 'pointsDifference', reverse: true}
    ));

    return sortedIndividualStats;
};

export const getCombinedMatchStats = (combinedTeamsList, sortedMatchStatsList) => {
    if (typeof sortedMatchStatsList !== 'object') {
      return null;
    }

    const combinedMatchStats = combinedTeamsList.map((combinedTeamNames, i) => {
      const firstTeamName = combinedTeamNames[0];
      const secondTeamName = combinedTeamNames[1];
      let wins = 0;
      let wins2to1 = 0;
      let draws = 0;
      let loses = 0;
      let loses1to2 = 0;
      let completed = 0;
      let open = 0;
      let setWon = 0;
      let setLoses = 0;
      let pointsLoses = 0;
      let pointsWon = 0;

      sortedMatchStatsList.forEach((oneTeamMatchStats, i) => {
        const currentTeamName = oneTeamMatchStats.name;
        
        if (firstTeamName === currentTeamName || secondTeamName === currentTeamName) {
          wins += oneTeamMatchStats.wins;
          wins2to1 += oneTeamMatchStats.wins2to1;
          draws += oneTeamMatchStats.draws;
          loses += oneTeamMatchStats.loses;
          loses1to2 += oneTeamMatchStats.loses1to2;
          completed += oneTeamMatchStats.completed;
          open += oneTeamMatchStats.open;
          setWon += oneTeamMatchStats.setWon;
          setLoses += oneTeamMatchStats.setLoses;
          pointsLoses += oneTeamMatchStats.pointsLoses;
          pointsWon += oneTeamMatchStats.pointsWon;
        }

      });

      return {
        name: `${firstTeamName}/${secondTeamName}`,
        wins,
        wins2to1,
        loses,
        loses1to2,
        draws,
        completed,
        completedWithoutDraws: completed - draws,
        completedWithoutDrawsString: `${completed - draws}/120`,
        open,
        all: completed + open,
        setLoses,
        setWon,
        pointsWon,
        pointsLoses,
        pointsDifference: pointsWon - pointsLoses,
        pointsRatio: roundNumber(pointsWon / pointsLoses, 3),
        winLoseMatch: `${wins} - ${loses}`,
        extendedWinLoseMatch: `${wins} (${wins2to1}) - ${loses} (${loses1to2})`,
        winLoseSet: `${setWon} - ${setLoses}`,
        winLosePoints: `${pointsWon} - ${pointsLoses}`,
        setPercent: `${roundNumber(100 * setWon / (setWon + setLoses), 2)}%`,
        setRatio: roundNumber(setWon / setLoses, 3)
      };
    });

    const sortedCombinedMatchStats = combinedMatchStats.sort(predicate(
      {name: 'wins', reverse: true}, 
      'loses', 
      {name: 'setRatio', reverse: true},
      {name: 'pointsDifference', reverse: true}
    ));

    return sortedCombinedMatchStats;
};

export const getSummaryStats = (sortedIndividualStats) => {
    if (typeof sortedIndividualStats !== 'object') {
      return null;
    }

    let wins = 0;
    let draws = 0;
    let loses = 0;
    let completed = 0;
    let open = 0;
    let setWon = 0;
    let setLoses = 0;
    let pointsLoses = 0;
    let pointsWon = 0;

    sortedIndividualStats.forEach((individualStats, i) => {
      wins += individualStats.wins;
      draws += individualStats.draws;
      loses += individualStats.loses;
      completed += individualStats.completed;
      open += individualStats.open;
      setWon += individualStats.setWon;
      setLoses += individualStats.setLoses;
      pointsLoses += individualStats.pointsLoses;
      pointsWon += individualStats.pointsWon;
    });

    wins /= 4;
    draws /= 4;
    loses /= 4;
    completed /= 4;
    open /= 4;
    setWon /= 2;
    setLoses /= 2;
    pointsLoses /= 2;
    pointsWon /= 2;

    const summaryStats = [{
      wins,
      loses,
      draws,
      completed,
      completedWithoutDraws: completed - draws,
      completedWithoutDrawsString: `${completed - draws}/180`,
      open,
      all: completed + open,
      setLoses,
      setWon,
      pointsWon,
      pointsLoses,
      pointsDifference: pointsWon - pointsLoses,
      pointsRatio: roundNumber(pointsWon / pointsLoses, 3),
      winLoseMatch: `${wins} - ${loses}`,
      winLoseSet: `${setWon} - ${setLoses}`,
      winLosePoints: `${pointsWon} - ${pointsLoses}`,
      setPercent: `${roundNumber(100 * setWon / (setWon + setLoses), 2)}%`,
      matchRatio: `${roundNumber(100 * (completed - draws) / (completed - draws + open), 2)}%`,
      setRatio: roundNumber(setWon / setLoses, 3)
    }];

    return summaryStats;
};