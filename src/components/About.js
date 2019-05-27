import React, { Component } from 'react';

class About extends Component {

  render() {
    return (
      <div className='row'>
        <div className='columns medium-6 large-4 small-centered'>
          <h1 className='text-center page-title'>O aplikacji</h1>
          <p>Lista wykorzystanych technologii:</p>
          <ul>
            <li>
              <a href='https://facebook.github.io/react'>React</a> - Frontend
            </li>
            <li>
              <a href='https://expressjs.com/'>Express (Node)</a> - Backend
            </li>
            <li>
              <a href='https://api.challonge.com/pl/api.html'>Challonge API</a> - API do zabawy z danymi turniejów 'challonge'.
            </li>
          </ul>
        </div>
      </div>
    );
  }
};

export default About;
