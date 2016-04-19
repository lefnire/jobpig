import {l} from './helpers';

let title = 'Best Tech Job Boards (+Remote)';
let date = '2016-04-20';

let teaser = <p>There are hundreds, if not thousands, of online job boards - and many (most?) for tech. They vary <em>wildly</em> in quality (by which I mean serious, well-paying employers). In this post I'll cover the best boards from my experience. I'll edit this post periodically, and eventually take comments so people can recommend their favorites / correct me.</p>;

let body = <div>
  {teaser}
  <h3>General</h3>
  <h4>The Good</h4>
  <ul>
    <li>{l('Github Jobs', 'https://jobs.github.com/')}</li>
    <li>{l('Stack Overflow Jobs', 'https://stackoverflow.com/jobs')}</li>
    <li>{l('AngelList', 'https://angel.co/')}</li>
    <li>{l('Dice', 'http://www.dice.com/')}</li>
    <li>{l('Jobpig', 'https://jobpigapp.com/')}</li>
  </ul>
  <p>These are my personal favorites. I've found fantastic-quality gigs from these boards. Their search functions are fine-grained and tech-geared. Employers who post here are hip and with the latest technology trends. Well-funded startups and the like.</p>
  <h4>The "OK"</h4>
  <ul>
    <li>{l('Indeed','https://indeed.com')}</li>
    <li>{l('SimplyHired','https://simplyhired.com')}</li>
    <li>{l('LinkedIn','https://linkedin.com')}</li>
    <li>{l('Monster','http://www.monster.com/')}</li>
    <li>{l('CareerBuilder','https://careerbuilder.com')}</li>
  </ul>
  <p>Everyone knows Monster & Indeed - those are the heavy-hitters. But these are general boards, not tech-geared. Their search functions are crude compared to the previous list which let you filter - or at least shows you - skills, salary, equity, etc. Their tech postings tend to be by very large "legacy" companies (Java, .NET). YMMV, definitely give them a shot - you may have a different experience.</p>
  <h3>Remote</h3>
  <p>If you're looking for remote work - contract / freelance (digital nomad); or even full-time W2, but ain't up-n-moving to San Francisco, here are tips.</p>
  <h4>The Good</h4>
  <p>Firstly, check out {l('NoDesk', 'http://nodesk.co/')} and {l('Awesome Remote Job', 'https://github.com/lukasz-madon/awesome-remote-job/')} - curated resources for remote workers, and lists of remote job boards. Afterwards decide:</p>
  <ol>
    <li>Are you looking for a serious, high-quality remote W2? Use "The Good" from "General" above - they double as quality remote-work sites. The jobs indicate whether they're remote-friendly.</li>
    <li>Or are you looking for more contractor / freelancer gigs (think beach-side digital nomads). If so, these are my favorite boards:</li>
  </ol>
  <ul>
    <li>{l('Working Nomads', 'http://www.workingnomads.co')}</li>
    <li>{l('WFH.io', 'https://www.wfh.io')}</li>
    <li>{l('We Work Remotely', 'https://weworkremotely.com')}</li>
    <li>{l('Virtual Vocations', 'https://www.virtualvocations.com')}</li>
    <li>{l('Landing.jobs', 'https://landing.jobs')}</li>
    <li>{l('Jobspresso', 'https://jobspresso.co')}</li>
    <li>{l('Jobmote', 'http://jobmote.com')}</li>
    <li>{l('Authentic Jobs', 'https://authenticjobs.com')}</li>
    <li>{l('RemoteOK', 'https://remoteok.io')}</li>
    <li>{l('Behance','https://www.behance.net/joblist')} (for designers)</li>
  </ul>
  <h4>The OK</h4>
  <p>The following boards "mean well," but but have never ended up landing me solid work:</p>
  <ul>
    <li>{l('Gun.io', 'https://gun.io/')} - great system, but their job churn is too slow. I rarely see new posts.</li>
    {/*<li>{l('remoteworkhunt', 'http://www.remoteworkhunt.com')}</li>*/}
    {/*<li>{l('offsite.careers', 'http://offsite.careers')}</li>*/}
    <li>{l('PeoplePerHour', 'http://www.peopleperhour.com/')} - started off fantastic, but began leaning towards offshore, rendering rates non-competitive.</li>
    <li>{l('Hasjob', 'https://hasjob.co')}</li>
    <li>{l('Flexjobs', 'https://www.flexjobs.com')}</li>
  </ul>
  <h4>The Ugly</h4>
  <p>And finally, the penny jobs. Posted by upstart college-grads looking for a $5 Facebook clone; your competition is offshore, so balk all you want, they'll get what they requested. While I disparage these boards for finding remote work yourself, they're great for hiring talent for <em>your</em> projects! I use these sites for commissioning logos, icons, and discrete chunks of small independent work.</p>
  <ul>
    <li>oDesk / Elance / Upwork (all the same, rebranded as Upwork)</li>
    <li>Freelancer</li>
    <li>Guru</li>
    <li>Fiverr</li>
  </ul>

  <h3>Jobpig</h3>
  <p>{l('Jobpig','https://jobpigapp.com')} is my favorite, but I'm biased. It aggregates the highest quality boards above, so you only have to look in one location. And instead of using search, you <em>rate</em> jobs (thumbs up/down, like Pandora) which teaches it your search preferences so it can find the best-matching posts. {l('Give it a shot!','https://jobpigapp.com')}</p>
</div>;

export default {title, date, teaser, body};