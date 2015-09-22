let Main = require('../main.jsx');
import expect from 'expect.js';

describe('Jobpig', ()=>{
  beforeEach(function() {
    let {TestUtils} = React.addons;
    this.component = TestUtils.renderIntoDocument(<Main />);
    this.renderedDOM = () => React.findDOMNode(this.component);
  });
  it('Something', ()=>{
    let renderedParagraphs = this.renderedDOM().querySelectorAll("p");

    expect(this.renderedDOM().children.length).toEqual(1);
    expect(renderedParagraphs.length).toEqual(1);
    expect(renderedParagraphs[0].textContent).toEqual("Hello, my first test!");
  })

})
