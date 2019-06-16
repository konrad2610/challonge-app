import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import { getMatchStats, getIndividualStats, getSummaryStats} from './utils/stats';

import ResponsiveTable from './components/ResponsiveTable';
import About from './components/About';
import Nav from './components/Nav';
const NotFound = () => <h1>404 Not Found</h1>;

class Home extends Component {
  state = {
    participantsWithMatches: '',
    participants: '',
    sortedMatchStats: '',
    sortedIndividualStats: '',
    summaryStats: '',
    isLoading: true,
    isIndividualStatsLoading: true
  };

  componentDidMount() {
    this.getChallongeParticipants()
      .then((res) => {
        this.setState({ participants: res.data });
        return res.data;
      })
      .then(async (participants) => {
        const participantsWithMatches = await Promise.all(participants.map(async (participant) => {
          const participantWithMatches = await this.getChallongeParticipantWithMatches(participant.participant.id);
          return participantWithMatches.data.participant;
        }));
        const sortedMatchStats = getMatchStats(participantsWithMatches);

        this.setState({ 
          participantsWithMatches: participantsWithMatches,
          sortedMatchStats: sortedMatchStats,
          isLoading: false
        });
        return sortedMatchStats;
      })
      .then((sortedMatchStats) => {
        const sortedIndividualStats = getIndividualStats([
          'Konrad', 'Fabian', 'Bartek', 'Krzysiek', 'Angelika', 'Szczepan'
        ], sortedMatchStats);
        
        this.setState({ 
          sortedIndividualStats: sortedIndividualStats,
          isIndividualStatsLoading: false
        });
        return sortedIndividualStats
      })
      .then((sortedIndividualStats) => {
        const summaryStats = getSummaryStats(sortedIndividualStats);

        this.setState({
          summaryStats: summaryStats
        });
        return summaryStats;
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

  renderResponsiveTable() {
    if (this.state.isLoading) {
      return <h3 className='text-center page-title'>Trwa pobieranie wyników turnieju...</h3>;
    } else if (this.state.sortedMatchStats) {
      return <ResponsiveTable title={'Wyniki drużynowe'} columns={{
          name: 'Drużyna', 
          completedWithoutDraws: 'Mecze (z 12)',
          extendedWinLoseMatch: 'Mecze W(2:1) - P(1:2)',
          winLoseSet: 'Sety W-P',
          setRatio: 'Sety Ratio',
          winLosePoints: 'Bramki',
          pointsRatio: 'Bramki Ratio',
        }} rows={this.state.sortedMatchStats} />;
    }
  };

  renderIndividualStatsResponsiveTable() {
    if (this.state.isIndividualStatsLoading) {
      return '';
    } else if (this.state.sortedIndividualStats) {
      return <ResponsiveTable title={'Wyniki indywidualne'} columns={{
          name: 'Zawodnik', 
          completedWithoutDraws: 'Mecze (ze 120)',
          extendedWinLoseMatch: 'Mecze W(2:1) - P(1:2)',
          winLoseSet: 'Sety W-P',
          setRatio: 'Sety Ratio',
          winLosePoints: 'Bramki',
          pointsRatio: 'Bramki Ratio'
        }} rows={this.state.sortedIndividualStats} />;
    }
  };

  renderSummaryStatsResponsiveTable() {
    if (this.state.summaryStats) {
      return <ResponsiveTable title={'Ogólne'} columns={{
          matchRatio: 'Progres turnieju',
          completedWithoutDraws: 'Mecze rozegrane',
          open: 'Mecze do rozegrania',
          setWon: 'Sety rozegrane',
          pointsWon: 'Strzelone bramki'
        }} rows={this.state.summaryStats} />;
    }
  };

  render() {
    return (
      <div className="App">
        <header className="App-header"></header>
        {this.renderResponsiveTable()}
        {this.renderIndividualStatsResponsiveTable()}
        {this.renderSummaryStatsResponsiveTable()}
      </div>
    );
  }
}

const App = () => (
  <Router>
    <div>
      <Nav/>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </Router>
);

export default App;
