import * as Cothority from "@dedis/cothority";

export {
  Cothority
};

window.onload=function(){
    var checkPageButton = document.getElementById('fullpage');
    if(checkPageButton){
        checkPageButton.addEventListener('click', function() {
          var url;

          chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
              url = tabs[0].url;
              p.innerText = url;
          });
        const p = document.getElementById('status');

    }, false);
  }
}

export function PrintInfo(data: string) {
 console.log("Let's load this ledger")
 let cot = Cothority.network.Roster
 const r = cot.fromTOML(data)
 const rpc = new Cothority.status.StatusRPC(r);
 const p = document.getElementById('status');
 rpc.getStatus(0).then(
 (r) => {
   p.innerText = r.toString();
 },
 (e) => p.innerText = "something went wrong. Did you start the conodes ?"+e,
 );
}
