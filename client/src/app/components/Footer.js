import React from 'react';
import FullWidthSection from './front/full-width-section';
import mui from 'material-ui';
const {Colors} = mui.Styles;

export default class Footer extends React.Component {
  render() {
    let styles = {
      footer: {
        backgroundColor: Colors.blueGrey500,
        textAlign: 'center',
        color: Colors.grey50,
        marginTop: 200, 



      },
      li: {
        listStyle: 'none'
      },
      link: {
        color: "white",
        //textDecoration: "none",
      }
    };

    return (
      <FullWidthSection style={styles.footer}>
        <ul className='footer-links'>
          <li style={styles.li}>
            <a href="mailto:tylerrenelle@gmail.com" style={styles.link}>Contact Us</a>
          </li>
          <li style={styles.li}>
            <a href="https://github.com/lefnire/jobpig" style={styles.link}>Fork on GitHub</a>
          </li>
          <li style={styles.li}>
            <a href="http://www.freepik.com/free-photos-vectors/animal" style={styles.link}>Animal vector designed by Freepik</a>
          </li>
        </ul>
      </FullWidthSection>
    );
  }
}
