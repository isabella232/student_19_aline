//import Cothority from "@dedis/cothority";

window.onload=function(){
    var checkPageButton = document.getElementById('fullpage');
    if(checkPageButton){
    checkPageButton.addEventListener('click', function() {

      chrome.tabs.getSelected(null, function(tab) {
        alert("Hello..! It's my first chrome extension.");
      });
    }, false);
  }
}
