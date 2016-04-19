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
            <a href="mailto:admin@jobpigapp.com">Contact Us</a>
          </li>
          <li >
            <a href="https://github.com/lefnire/jobpig" >Fork on GitHub</a>
            {/*<iframe src="https://ghbtns.com/github-btn.html?user=lefnire&repo=jobpig&type=fork&count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe>*/}
          </li>
          <li>
            <a href="/blog.html">Blog</a>
          </li>
          <li>
            <a href="http://www.freepik.com/free-photos-vectors/animal">Animal vector designed by Freepik</a>
          </li>
        </ul>
      </Jumbotron>
    );
  }
}
