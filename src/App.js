import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';

import ResponsiveTable from './components/ResponsiveTable';
import About from './components/About';
import Nav from './components/Nav';
const NotFound = () => <h1>404 Not Found</h1>;

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

class Home extends Component {
  state = {
    participantsWithMatches: '',
    participants: '',
    sortedMatchStats: ''
  };

  componentDidMount() {
    this.getChallongeParticipants()
      .then((res) => {
        console.log('all participants', res.data);
        this.setState({ participants: res.data });
        return res.data;
      })
      .then(async (participants) => {
        const participantsWithMatches = await Promise.all(participants.map(async (participant) => {
          const participantWithMatches = await this.getChallongeParticipantWithMatches(participant.participant.id);
          return participantWithMatches.data.participant;
        }));

        console.log('participantsWithMatches Array', participantsWithMatches);
        this.getMatchStats(participantsWithMatches);
        this.setState({ participantsWithMatches: participantsWithMatches });
      })
      .catch(err => console.log(err));
  }

  getChallongeParticipantWithMatches = async (participantId) => {
    const response = await fetch(`/.netlify/functions/server/api/challonge/participant-with-matches/${participantId}`);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  getChallongeParticipants = async () => {
    const response = await fetch('/.netlify/functions/server/api/challonge/participants');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  getMatchStats = (participantsWithMatchesList) => {
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

      participantWithMatches.matches.forEach((match, i) => {
        const actualMatch = match.match;
        if (actualMatch.state === 'complete') {
          completed += 1;
          
          const setsArray = actualMatch.scores_csv.split(',');

          setsArray.forEach((set, i) => {
            const setArray = set.split('-');

            if (actualMatch.player1_id === participantWithMatches.id) {
              pointsWon += Number(setArray[0]);
              pointsLoses += Number(setArray[1]);

              if (Number(setArray[0]) === 8) {
                setWon += 1;
              }
              if (Number(setArray[1]) === 8) {
                setLoses += 1;
              }

            } else {
              pointsWon += Number(setArray[1]);
              pointsLoses += Number(setArray[0]);

              if (Number(setArray[1]) === 8) {
                setWon += 1;
              }
              if (Number(setArray[0]) === 8) {
                setLoses += 1;
              }
            }
          });

          if (!actualMatch.winner_id) {
            draws += 1;
          } else if (actualMatch.winner_id === participantWithMatches.id) {
            wins += 1;
          } else {
            loses += 1;
          }
        } else if (actualMatch.state === 'open') {
          open += 1;
        }
      });

      return {
        name: participantWithMatches.name,
        id: participantWithMatches.id,
        wins,
        loses,
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
        winLoseMatch: `${wins} - ${loses}`,
        winLoseSet: `${setWon} - ${setLoses}`,
        winLosePoints: `${pointsWon} - ${pointsLoses}`,
        setRatio: `${roundNumber(100 * setWon / (setWon + setLoses), 2)}%`
      };
    });

    console.log('matchStats: ', matchStats);
    const sortedMatchStats = matchStats.sort(predicate(
      {name: 'wins', reverse: true}, 
      'loses', 
      {name: 'setRatio', reverse: true},
      {name: 'pointsDifference', reverse: true}
    ));
    console.log('matchStats: ', matchStats);
    this.setState({ sortedMatchStats: sortedMatchStats });
    return sortedMatchStats;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
        <ResponsiveTable columns={{
          name: 'Drużyna', 
          completedWithoutDrawsString: 'Rozegrane', 
          open: 'Do rozegrania', 
          winLoseMatch: 'Mecze W-P',
          winLoseSet: 'Sety W-P',
          setRatio: '% wygranych setów',
          pointsDifference: 'Różnica punktów',
          winLosePoints: 'Punkty W-P'
          }} rows={this.state.sortedMatchStats} />
        </header>
      </div>
    );
  }
}

const App = () => (
  <Router>
    <div>
      <Nav/>
      <div className='row'>
        <div className='columns medium-6 large-4 small-centered'>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/about" component={About} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  </Router>
);

export default App;
