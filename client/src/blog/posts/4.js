import {l} from './helpers';
import {Link} from 'react-router';

let title = 'Please Learn to Code';

let date = '2016-05-11';

//Photography © via Splitshare

let teaser = <p>It pays great money and is easy to learn.</p>;

let body = <div>
  {/*<img className="pic" src="/blog/program.jpg" />*/}

  {teaser}

  <p>A response to {l("Please don't learn to code", 'http://techcrunch.com/2016/05/10/please-dont-learn-to-code/')} (+{l('v1','http://blog.codinghorror.com/please-dont-learn-to-code/')}); plus <em>many</em> online and in-person debates I've had with fellow developers. Code is easy and lucrative, and if you disagree ("that's naive", "that's missing the bigger picture") you are <em>wrong</em>. My argument's strength is first-hand experience.</p>

  <p>I was once a Mormon missionary, from which I learned skills in evangelism. I've used that skill to convert friends to code. These friends were waiters, fruit-canners, baristas - even my wife, a nurse. I've never deigned to convince friends content with their jobs, or at least on a path (coffee-runner in their field). But when friends were making lousy cash for a lousy job, I say "you can make much more, possibly work at home (or even travel). If you hate code, you'll hate it less than __". My convincing worked; said friends learned code nights and weekends; said friends landed jobs, averaging $40/h. <em>Actually</em> $40/h, I'm not making that up to prove a point. I attend meetups where I met aspiring devs from code camps and online courses; most times they're already working. I once hired a {l('kid','https://github.com/paglias')} who was <b>dabbling</b> - code wasn't his interest, and he was our best programmer! Most - I repeat <em>most</em> - colleagues from my previous jobs had studied some dead-end degree and sold out, teaching themselves enough to pass an interview. They were <em>great</em> developers. {l("You don't need school","https://www.reddit.com/r/digitalnomad/comments/2zhlmt/what_kind_of_webdev_is_better_for_a_nomad/cpvqjxd")}. You can learn online for free. So when people say "you need algorithms / data-structures; the competition's stiff; you have to keep up with an impossibly-fast industry" - my eyes bulge as I point at him, her, her, him, her, him and say "they did it." Then I give you the bird, because you're just regurgitating what you heard online. Or you had a harder time of it yourself (maybe you picked the wrong tech stack). Or you resent your expensive degree being pissed on. So let's tackle these ridiculous myths.</p>

  <h4>You need algorithms, data structures, design patterns</h4>

  <p>Nope, you don't. You really, really don't. Using JavaScript? Lodash has your algorithms covered. Data structures and design patterns are covered by your framework of choice - React, Angular, etc. I hear you scoffing, your red face, "Frameworks? You need foundations!" Ask yourself truly, when did you last write (or even use!) a binary tree? A binary flipping tree, that's Computer Science 101. I've only ever heard the phrase "Pumping Lemma" once - college. It was the primary focus of the course. Sure there are useful patterns - Flux, MVC, etc - but you learn them as you go. My wife is a designer now - CSS, HTML, JavaScript. We had coffee with a friend who asked "but how did you get the job if you don't know basic algorithms?" to which she responded "what's an algorithm?" I never told her! *Face-palm* silly me! New and aspiring coders aren't learning to build search engines and AI; they're learning to cobble together a quickie in Wordpress for a buck.</p>
  <img className="pic" src="/blog/mancomputer.jpg" />

  <h4>You have to keep up with a fast-paced industry</h4>

  <p>Yep. 1h/day of reading, big whoop. I've had 1h/d of education on my {l('daily checklist','https://habitrpg.com/')} for years and years. I've always been right on the edge and highly competitive for that 1h, no more no less. Books, video-courses, whatever. You fall behind, well - it bites ya. That 1h is an investment in the bigger bucks you're making, so no skin off your back.</p>
  <img className="pic" src="/blog/Book.jpg"/>

  <h4>The competition is too stiff</h4>

  <p>Only if you're using the wrong job-sourcing media. Bid on Upwork and you're competing with $5/h pros offshore; apply to Google and you're competing with Computer Science PhDs. There's a middle ground. Let's break this down.</p>
  <p>Many freelancers I know say they're drowning in competition and low rates. Always, <em>always</em> they're using some content-mill bid board like Upwork or Freelancer. Duh! That's exactly what those boards are for - hiring cheap work! On the other side are devs striking out at big San Francisco companies' white-board code tests. First off, if you're doing this for easy cash, freedom, and maybe some big idea you have rattling in your head - don't apply to these companies. That's Computer Science territory, and this article is not for those people. Me, I'm done with companies that require a code test. I investigate early on and bow out. They can take a very long time (15h once!) and can be <em>very</em> difficult for even those with a degree.</p>
  <p>Those are two extremes - target somewhere in between, see my <Link to="/1">list of job boards</Link>. Apply to medium-sized companies.</p>
  <img className="pic" src="/blog/stiff3.jpg"/>

  <h4>Conclusion</h4>
  <p>Thing is, my wife <em>actually</em> started making cash before knowing the definition of "algorithm". Experience is people who disagree do so on principle, not evidence. Their example is some offshore-borked project (compared to American artisanal code) and their mustachios quiver with rage. Maybe it's the "Uncertainty Principle" as my real-life examples I partially coach. Perhaps striking out on your own without a helping hand is a different story. But I keep hearing the same thing over: "you need the fundamentals," and I keep seeing that <em>actually</em> proven wrong. Evidence speaks louder than theory.</p>

  <p>You {l("don't have to be great to succeed","https://medium.com/@WordcorpGlobal/programming-doesnt-require-talent-or-even-passion-11422270e1e4#.suwg09mo1")} in this industry. Not everyone needs be an engineer; some can be coders. You don't need countless years' experience in substack languages, understanding pointers and registers or a framework's history to succeed. Those nuggets will help you absolutely, but they're not strictly necessary. Am I encouraging mediocrity? Of course not, but the barrier to entry is lower than the nay-sayers say. You'll learn what you need as you go, and you have to start somewhere. <Link to="/2">Start here!</Link>.</p>

</div>;

export default {title, date, teaser, body};