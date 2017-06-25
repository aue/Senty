let sentiment = require('sentiment');

class Senty {
  contructor() {
    this.meterNode = null;
  }

  run() {
    this.addListeners();
  }

  addListeners() {
    window.addEventListener('focusin', e => {
      let nodeName = e.target.nodeName.toLowerCase();
      if (nodeName == 'textarea'
        || (nodeName == 'input' && e.target.hasAttribute('type') && e.target.type == 'text')
      ) {
        this.focusIn(e.target.value);
      }
    });

    window.addEventListener('input', e => {
      let nodeName = e.target.nodeName.toLowerCase();
      if (nodeName == 'textarea'
        || (nodeName == 'input' && e.target.hasAttribute('type') && e.target.type == 'text')
      ) {
        this.focusIn(e.target.value);
      }
    });

    window.addEventListener('focusout', e => {
      let nodeName = e.target.nodeName.toLowerCase();
      if (nodeName == 'textarea'
        || (nodeName == 'input' && e.target.hasAttribute('type') && e.target.type == 'text')
      ) {
        this.focusOut();
      }
    });
  }

  focusIn(input) {
    if (!this.meterNode) this.addMeterToPage();
    // Run sentiment analysis and show meter
    this.runAnalysis(input);
    this.meterNode.style.display = 'block';
  }

  focusOut() {
    if (!this.meterNode) return;
    // Hide meter
    this.meterNode.style.display = 'none';
  }

  runAnalysis(input) {
    let analysis = sentiment(input);
    this.meterNode.contentDocument.querySelector('.score').innerText = analysis.score;

    let align = 'center';
    if (analysis.score < -2) align = 'left';
    else if (analysis.score > 2) align = 'right';
    this.meterNode.contentDocument.querySelector('.scale').style.textAlign = align;

    this.meterNode.contentDocument.querySelector('.proTerms').innerHTML = '';
    for (let i = 0; i < analysis.positive.length; i++) {
      let span = document.createElement('span');
      span.innerText = analysis.positive[i];
      this.meterNode.contentDocument.querySelector('.proTerms').appendChild(span);
    }

    this.meterNode.contentDocument.querySelector('.conTerms').innerHTML = '';
    for (let i = 0; i < analysis.negative.length; i++) {
      let span = document.createElement('span');
      span.innerText = analysis.negative[i];
      this.meterNode.contentDocument.querySelector('.conTerms').appendChild(span);
    }

    this.meterNode.style.height = (this.meterNode.contentDocument.getElementById('senty').offsetHeight + 10) + 'px';
  }

  addMeterToPage() {
    let meter = document.createElement('iframe');
    document.documentElement.appendChild(meter);
    meter.style.cssText = 'display: none; position: fixed; bottom: 15px; left: 15px; width: 227px; height: auto; background: transparent; border: 0; z-index: 10000';

    let stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('type', 'text/css');
    stylesheet.setAttribute('href', chrome.runtime.getURL('assets/style.css'));
    meter.contentDocument.head.appendChild(stylesheet);

    meter.contentDocument.body.innerHTML = `<div id="senty">
      <h1>Current Analysis</h1>
      <div class="meter">
        <div class="scale">
          <span class="score">0</span>
        </div>
      </div>
      <h2>Positive Terms</h2>
      <div class="terms proTerms"></div>
      <h2>Negative Terms</h2>
      <div class="terms conTerms"></div>
    </div>`;

    this.meterNode = meter;
  }
}

function runSenty() {
  let senty = new Senty();
  senty.run();
}

if (['complete', 'loaded', 'interactive'].indexOf(document.readyState) > -1) {
  runSenty();
}
else {
  document.addEventListener('DOMContentLoaded', function(e) {
    runSenty();
  });
}
