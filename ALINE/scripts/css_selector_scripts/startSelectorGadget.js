// Retrieve CSS Selector by loading Selector Gadget
var s = document.createElement('div');
s.innerHTML='Loading...';
s.style.color='black';
s.style.padding='20px';
s.style.position='fixed';
s.style.zIndex='9999';
s.style.fontSize='3.0em';
s.style.border='2px solid black';
s.style.right='40px';
s.style.top='40px';
s.setAttribute('class','selector_gadget_loading');
s.style.background='white';
document.body.appendChild(s);
var t = document.createElement('script');
t.setAttribute('type','text/javascript');
t.setAttribute('src', 'https://dv0akt2986vzh.cloudfront.net/unstable/lib/selectorgadget.js');
document.body.appendChild(t);
