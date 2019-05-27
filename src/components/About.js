import React, { Component } from 'react';

class About extends Component {

  render() {
    return (
      <div>
        <h1 className='text-center page-title'>About</h1>
        <p>This is a challonge application build on React.</p>
        <p>Here are some of the tools used:</p>
        <ul>
          <li>
            <a href='https://facebook.github.io/react'>React</a> - JavaScript framework.
          </li>
          <li>
            <a href='https://api.challonge.com/pl/api.html'>Challonge API</a> - API to search for challonge tournament data.
          </li>
          <li>
            <a href='https://github.com/konrad2610/challonge-app'>Repo</a> - Project repo.
          </li>
        </ul>
      </div>
    );
  }
};

export default About;
