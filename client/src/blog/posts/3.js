import {l} from './helpers';
import {Link} from 'react-router';

let title = 'Do I Need to Program to Work Remotely?';
let date = '2016-04-20';

let teaser = <p>A common question from aspiring digital nomads: "do I have to be a programmer?" The answer is of course no, not technically; but you should strongly consider it.</p>;

let body = <div>
  {teaser}

  <p>First, I don't just mean C++; I mean web & mobile development and design, graphic design, marketing - basically high tech... for a tech company... based in San Francisco. This compared to non-tech jobs like WWOOFing, ESL; and tech, but cut-rate competitive bits like photography, blogging, and book-writing. There'll be disagreement by well-paid professionals in fields I disparage. I'd bet they've been doing it long enough to establish themselves as highly-sought experts. Tech has a much lower barrier to entry for higher, faster yield. This post is for readers interested in just that.</p>

  <p>As you're reading this, consider {l("one blogger's yearly travel cost", 'http://www.neverendingfootsteps.com/2016/02/16/how-much-does-it-cost-to-travel-the-world-for-a-year-my-2015-expenses/')} of $20k. Bear in mind she did it <em>on the cheap</em> (my own best-efforts were closer to $40k), so pad a bit.</p>

  <h4>Non-Tech</h4>
  <p>Let's start with non-technical jobs I see touted for remote work.</p>
  <ul>
    <li><b>ESL & Translators.</b> The average ESL salary {l('in the USA is $40k','http://www.payscale.com/research/US/Job=English_as_a_Second_Language_(ESL)_Teacher/Salary')}. Likely you're looking to teach elsewhere, so use said as a baseline adjusted to your destination's economy. $40k was my travel budget, so there's no room to err. Additionally, you'll have to perma-locate. If you know Spanish, wanting to teach in Spain, this is your jam - but many want to hop-hop-hop.</li>
    <li><b>Flight Attendant, Tour Guide.</b> Don't you need schooling to be a flight attendant? It's {l('$20/h','http://www.payscale.com/research/US/Job=Flight_Attendant/Hourly_Rate')}. You're in the air more than on the ground, and you don't really get to pick where you go. Tour guides will be competing with a destination's own tour guides.</li>
    <li><b>WWOOFing.</b> This is a unique bit - you work on a farm for room, board, and food. You don't make money. Some people do it for the experience of staying on a farm, working and hanging with the locals - so if that's your thing, great. But just consider - you don't make money. Do you have savings?</li>
    <li><b>Traveling Nurse.</b> You have to be a nurse; ain't something you'll pick up in a couple months.</li>
  </ul>

  <h4>Cut-Rate Tech</h4>
  <p>Technical jobs, true; but you have huge competition, or you get pennies-on-the-dollar, or you have to strike a lucky break, etc.</p>
  <ul>
    <li><b>Freelance Writer, Blogger.</b> A blogger's salary {l('is $40k','http://www.payscale.com/research/US/Job=Blogger/Salary')}, assuming you're blogging / writing for another company. Which actually makes this viable remote work, if you're so doing! The concern I want to raise is that many bloggers plan a travel blog to strike gold. Yes that happens, but you can't count on it. That's the big break.</li>
    <li><b>Photographer.</b> {l('$24/h','http://www.payscale.com/research/US/Job=Freelance_Photographer/Hourly_Rate')}. Per above, are you doing photography for a home-based company; or are you planning on travel photography?</li>
    <li><b>eBook Publishing.</b> Similar to the above, this can make a lot of money... in the jackpot. If you're going to count on this revenue flow, be sure it's flowing first.</li>
    <li><b>Virtual Assistant / Customer Service.</b> {l('$16/h', 'http://www.payscale.com/research/US/Job=Virtual_Assistant/Hourly_Rate')}, and boy does it sound fun!</li>
  </ul>

  <h4>Tech</h4>
  <p>Here's the thing about code - it's a lot easier than you think; you're psyching yourself out! I've read many accounts of waiter-gone-iOS-apps who put in 1-3 months' learning before cold-turkey. I've personally converted and coached code newbies, seeing 3 months as a standard turnaround; one month in cases where people dedicated 40h/wk learning. You don't need school ({l("don't do school!",'https://www.reddit.com/r/digitalnomad/comments/2zhlmt/what_kind_of_webdev_is_better_for_a_nomad/cpvqjxd')}), just dedication. A common starting web dev rate I see is $40/h 1099. {l('iOS Developer, $80k median','http://www.payscale.com/research/US/Job=iOS_Developer/Salary')}. That's double the best positions above! You're not limited by any factor save wifi (more than can be said for most remote jobs). You can hop countries as often as you want - you're working for home-based companies. It's the most liberating digital nomad experience, from experience!</p>
  <p>I think when people consider coding with fear, they're thinking of backend engineers. Target front-end development / design, it has a very low barrier to entry. <Link to="/2">Start here!</Link></p>
</div>;

export default {title, date, teaser, body};