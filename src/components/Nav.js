import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Nav extends Component {
  render() {
    return (
      <div className='top-bar'>
        <div className='top-bar-left'>
          <ul className='menu'>
            <li className='menu-text'>Challonge App</li>
            <li>
              <Link to='/'>Wyniki</Link>
            </li>
            <li>
              <Link to='/about'>O aplikacji</Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
};

export default Nav;
