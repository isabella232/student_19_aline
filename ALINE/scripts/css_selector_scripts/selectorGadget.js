function importJS(src, look_for, onload) {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
  if (onload) wait_for_script_load(look_for, onload);
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

function importCSS(href, look_for, onload) {
  var s = document.createElement('link');
  s.setAttribute('rel', 'stylesheet');
  s.setAttribute('type', 'text/css');
  s.setAttribute('media', 'screen');
  s.setAttribute('href', href);
  if (onload) wait_for_script_load(look_for, onload);
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

function wait_for_script_load(look_for, callback) {
  var interval = setInterval(function() {
    if (eval("typeof " + look_for) != 'undefined') {
      clearInterval(interval);
      callback();
    }
  }, 50);
}

(function(){
  importCSS('https://dv0akt2986vzh.cloudfront.net/stable/lib/selectorgadget.css');
  importJS('./scripts/css_selector_scripts/jquery-3.4.1.js', 'jQuery', function() { // Load everything else when it is done.
    jQuery.noConflict();
    importJS('./scripts/css_selector_scripts/diff_match_patch.js', 'diff_match_patch', function() {
      importJS('./scripts/css_selector_scripts/dom.js', 'DomPredictionHelper', function() {
        importJS('./scripts/css_selector_scripts/interface.js');
      });
    });
  });
})();
