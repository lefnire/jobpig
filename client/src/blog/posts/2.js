import {l} from './helpers';
import {Link} from 'react-router';

let title = 'Learn to Code - Shortcut for Digital Nomads';
let date = '2016-04-20';

let teaser = <p>Your friends are making a killing computer programming; or they're traveling with road-work, and it's making you green. You keep meaning to pick it up, but don't know where to start (so many languages... should I go to school?). There are many opinions on the languages / frameworks / learning-methods; here's mine. I think it's well informed, having converted my fair share to the dark side :)</p>;

let body = <div>
{teaser}
<p>Your primary focus should be developing or designing websites & mobile apps (iOS & Android). You'll need to learn:</p>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
<p>In that order. Codecademy courses {l('1','https://www.codecademy.com/learn/web')} {l('2','https://www.codecademy.com/en/skills/make-a-website')} {l('3','https://www.codecademy.com/learn/javascript')}. Lucky you, the courses are free. In fact, almost all quality "learn to code online" is free! ({l('Code School','https://www.codeschool.com/')} is a for-pay and high-quality, but that's up to you if you want to spend). Also, {l("do NOT go to school",'https://www.reddit.com/r/digitalnomad/comments/2zhlmt/what_kind_of_webdev_is_better_for_a_nomad/cpvqjxd')}</p>
<p>When done, ask yourself: do I want to to develop or design? Left or right -brained? If right-brained, browse Codecademy & Code School for design & UX courses. I'm  unfamiliar with that territory unfortunately; my wife's a designer, I'll have her fill this piece out in the future. If you chose developer, read on.</p>

<p>Now that you know HTML / CSS / JS, learn a front-end framework to make fusing them simpler. Learn <em>either</em> React or Angular. Code School & Codecademy have Angular courses. React is newer, best bet there is videos on {l('Udemy','https://www.udemy.com/')} or {l('Egghead','https://egghead.io/')}. Do your own research on which to choose; I'll just say I prefer React.</p>

<p>How about mobile apps? Swift? Java? Why all the web stuff? These days, while you can (and many still champion) develop mobile apps in their native languages, you can also write them in HTML / CSS / JS. There are many frameworks for such; the two most promising contenders in my opinion are {l('Ionic','http://ionicframework.com')} and {l('React Native','https://facebook.github.io/react-native/')}. Which to pick is {l('a long story','https://www.quora.com/Which-Hybrid-Framewok-has-more-future-Ionic-React-or-Meteor')}. You'll use these frameworks to cross-compile to both iOS and Android (and WP if inclined).</p>
<p>At this point you'll know how to make websites & mobile apps, all you need to land a well-paying remote job! First, read <Link to="/0">Find Tech Jobs</Link>. If you have trouble finding a gig (you shouldn't, it's a thirsty industry!) {l('email me','mailto:admin@jobpigapp.com')} and I'd be happy to help you find work.</p>

<h3>Much later</h3>
<p>Notice my focus on front-end jobs. Clients are more amenable to entry-level (and remote) front-end developers / designers than they are to backend. You'll have more success starting on front-end. Eventually you may find yourself wanting to learn server & database programming. Pick Node.js & MongoDB. One reason: they're both JavaScript technologies, meaning they'll be easy to learn. Heck, I prefer Python & PostgreSQL personally; but if you can keep your entire tech stack in one language, you'll get further faster. Additionally, JavaScript is {l('the most popular language','http://githut.info/')} meaning more job opportunities.</p>
</div>;

export default {title, date, teaser, body};