import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

const AnotherPage = () => <h1>Another Page</h1>;
const NotFound = () => <h1>404 Not Found</h1>;
class Home extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
    participantWithMatches: '',
    participants: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));

    this.getChallongeParticipantWithMatches()
      .then((res) => {
        console.log('participants with matches', res.data.participant);
        return this.setState({ participantWithMatches: res.data.participant });
      })
      .catch(err => console.log(err));

    this.getChallongeParticipants()
      .then((res) => {
        console.log('all participants', res.data);
        return this.setState({ participants: res.data });
      })
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/.netlify/functions/server/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  getChallongeParticipantWithMatches = async () => {
    const response = await fetch('/.netlify/functions/server/api/challonge/participant-with-matches');
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

  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/.netlify/functions/server/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <p>{this.state.response}</p>
          <p>{this.state.participantWithMatches.name}</p>
          <form onSubmit={this.handleSubmit}>
            <p>
              <strong>Post to Server:</strong>
            </p>
            <input
              type="text"
              value={this.state.post}
              onChange={e => this.setState({ post: e.target.value })}
            />
            <button type="submit">Submit</button>
          </form>
          <p>{this.state.responseToPost}</p>
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
