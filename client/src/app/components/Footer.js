import React from 'react';

import {
  Jumbotron
} from 'react-bootstrap';

export default class Footer extends React.Component {
  render() {
    return (
      <Jumbotron className="footer">
        <ul className='footer-links'>
          <li>
            <a href="mailto:tylerrenelle@gmail.com">Contact Us</a>
          </li>
          <li >
            <a href="https://github.com/lefnire/jobpig" >Fork on GitHub</a>
          </li>
          <li>
            <a href="http://www.freepik.com/free-photos-vectors/animal">Animal vector designed by Freepik</a>
          </li>
        </ul>
      </Jumbotron>
    );
  }
}
