import {l} from './helpers';
import {Link} from 'react-router';

let title = 'Find Tech Jobs';
let date = '2016-04-19';

let teaser =
<p>This is the first of a blog on all things job-finding. It'll be tech-focused in the beginning (web & mobile development, design, content, etc); though I'll expand that as {l('Jobpig','https://jobpigapp.com')} finds broader audience. It'll also lean strongly towards remote work / contracting, as {l('my wife and I','http://ocdevel.com')} are digital nomads. This post in particular is for tech jobs.</p>;

let body =
<div>
  {teaser}
  <h4>Finding Tech Jobs</h4>
  <p>There are many ways to find jobs, but I've found the following three most effective: networking, LinkedIn, and online job boards. Networking will yield the best success, but requires more hands-on; LinkedIn runs passively in the background; job boards are your shotgun approach to use between networking events. Let's dive in.</p>

  <h4>Networking</h4>
  <p>Networking should be your bread-and-butter. Meeting potential clients face-to-face gives them more trust. It also invokes more personal respect, which results in (1) a better employee-employer relationship; (2) better pay. That may seem exaggerated, but it's <em>invariably</em> been the case in my experiences.</p>
  <p><b>Attend networking events.</b> There are likely many professional networking events near you. Used to be these were mostly independently hosted; nowadays most are advertised on {l('Meetup.com', 'https://meetup.com')}. Either they're recurring events through a Meetup group, or they're independent with a one-off post through a relevant Meetup. Search Meetup for groups in your skillset: JavaScript, Design, Data Science, etc. In my opinion this method trumps all - most of my quality gigs have been a direct or indirect contact made from Meetups. If all else fails, you'll keep abreast your field and make new friends.</p>
  <p><b>Ask your social networks.</b> Put your friends to work :) I've had great success posting to Twitter and Facebook "who's hiring?". Your friends have your back, and will only refer you matching gigs by quality clients. Trust them.</p>

  <h4>LinkedIn</h4>
  <p>Nowadays LinkedIn is your online resume (in tech anyway). It's the majority way that I'm <em>found</em> by recruiters and employers; and increasingly these guys ask for my LI profile rather than my resume. Additionally, it's easier to keep up with LI than constantly updating a resume - <strike>and LI lets you export your profile to resume</strike> (*gasp* did they remove that? that was so useful!). LI is crap for <em>finding</em> jobs; instead, jobs <em>find you</em> by recrutiers / employers on LI. Consider LI your portfolio - fill it out as thoroughly as possible, let it run in the background, and step away.</p>

  <h4>Job Boards</h4>
  <p>Finally, job boards. LinkedIn is passive; it works for you in the background. Networking is active, and will land your highest-quality jobs; but there's only so many local events (say once a week). Job boards are your daily shotgun to fill the gaps. <Link to='/1'>Continue reading here</Link> (job boards warrant their own post).</p>

</div>;

// Next post on job boards

export default {title, date, teaser, body};