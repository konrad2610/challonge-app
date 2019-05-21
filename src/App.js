import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import './App.css';

const AnotherPage = () => <h1>Another Page</h1>;
const NotFound = () => <h1>404 Not Found</h1>;
class Home extends Component {
  state = {
    participantsWithMatches: '',
    participants: ''
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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Lista uczestników challonge'u:
          </p>
          {typeof this.state.participantsWithMatches === 'object' ? this.state.participantsWithMatches.map((participantsWithMatches, i) => {
              return (
                  <p>{i+1}. {participantsWithMatches.name}, {participantsWithMatches.id}</p>
              );
          }) : ''}
        </header>
      </div>
    );
  }
}

const App = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/another-page/">Another Page</Link>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/another-page/" component={AnotherPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </Router>
);

export default App;
