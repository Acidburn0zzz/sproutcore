// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*globals CoreTest Q$ */

sc_require('jquery');
sc_require('system/plan');

/** @static
  The runner will automatically run the default CoreTest.plan when the 
  document is fully loaded.  It will also act as a delegate on the plan, 
  logging the output to the screen or console.

  @since SproutCore 1.0
*/
CoreTest.Runner = {
  
  /**
    The CoreTest plan.  If not set, a default plan will be created.
  */
  plan: null,
  
  create: function() {
    var len = arguments.length,
        ret = CoreTest.beget(this),
        idx ;
        
    for(idx=0;idx<len;idx++) CoreTest.mixin(ret, arguments[len]);
    if (!ret.plan) ret.plan = CoreTest.Plan.create({ delegate: ret });
    Q$(window).load(function() { ret.begin(); });      
    return ret ;
  },
  
  begin: function() {
    var plan = CoreTest.plan;
    plan.delegate = this;
    plan.run();
  },
  
  planDidBegin: function(plan) {
    // setup the report DOM element.
    this.report = Q$(['<div class="core-test">',
      '<div class="useragent">UserAgent</div>',
      '<p class="testresult">',
        '<label class="hide-passed">',
          '<input type="checkbox" checked="checked" /> Hide passed tests',
        '</label>',
        '<span class="status">Running...</span>',
      '</p>',
      '<div class="detail">',
        '<table>',
          '<thead><tr>',
            '<th class="desc">Test</th><th>Result</th>',
          '</tr></thead>',
          '<tbody><tr></tr></tbody>',
        '</table>',
      '</div>',
    '</div>'].join(''));

      
    this.report.find('.useragent').html(navigator.userAgent);
    this.logq = this.report.find('tbody');
    
    // listen to change event
    var runner = this;
    this.checkbox = this.report.find('.hide-passed input'); 
    this.checkbox.change(function() {
      runner.hidePassedTestsDidChange();
    });
    
    Q$('body').append(this.report);
  },
  
  hidePassedTestsDidChange: function() {
    var checked = !!this.checkbox.val();
        
    if (checked) {
      this.logq.addClass('hide-clean');
    } else {
      this.logq.removeClass('hide-clean');
    }
  },
  
  planDidFinish: function(plan, r) {
    var result = this.report.find('.testresult .status');
    var str = CoreTest.fmt('Completed %@ tests in %@ msec. <em><span class="total">%@</span> total assertions: ', r.tests, r.runtime, r.total);
    
    if (r.passed > 0) {
      str += CoreTest.fmt('&nbsp;<span class="passed">%@ passed</span>', r.passed);
    }
    
    if (r.failed > 0) {
      str += CoreTest.fmt('&nbsp;<span class="failed">%@ failed</span>', r.failed);
    }

    if (r.errors > 0) {
      str += CoreTest.fmt('&nbsp;<span class="errors">%@ error%@</span>', r.errors, (r.errors !== 1 ? 's' : ''));
    }

    if (r.warnings > 0) {
      str += CoreTest.fmt('&nbsp;<span class="warnings">%@ warnings%@</span>', r.warnings, (r.warnings !== 1 ? 's' : ''));
    }

    // if all tests passed, disable hiding them.  if some tests failed, hide
    // them by default.
    if ((r.failed + r.errors + r.warnings) > 0) {
      this.hidePassedTestsDidChange(); // should be checked by default
    } else {
      this.report.find('.hide-passed').addClass('disabled')
        .find('input').attr('disabled', true);
    }     
    result.html(str);
  },
  
  planDidRecord: function(plan, module, test, assertions) {
    var name = test, 
        s    = { passed: 0, failed: 0, errors: 0, warnings: 0 }, 
        len  = assertions.length, 
        clean = '', 
        idx, cur, q;
    
    for(idx=0;idx<len;idx++) s[assertions[idx].result]++;
    if ((s.failed + s.errors + s.warnings) === 0) clean = "clean" ;
    
    if (module) name = module + " module: " + test ;
    q = Q$(CoreTest.fmt('<tr class="test %@"><th class="desc" colspan="2">%@ (<span class="passed">%@</span>, <span class="failed">%@</span>, <span class="errors">%@</span>, <span class="warnings">%@</span>)</th></tr>', clean, name, s.passed, s.failed, s.errors, s.warnings));
    
    //debugger ;
    this.logq.append(q);
    
    len = assertions.length;
    for(idx=0;idx<len;idx++) {
      cur = assertions[idx];
      clean = cur.result === CoreTest.OK ? 'clean' : 'dirty';
      q = Q$(CoreTest.fmt('<tr class="%@"><td class="desc">%@</td><td class="action %@">%@</td></tr>', clean, cur.message, cur.result, (cur.result || '').toUpperCase()));
      this.logq.append(q);
    }
  }
  
};
