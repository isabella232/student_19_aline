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

const roster = `[[servers]]
Address = "tls://188.166.35.173:7770"
Url = "https://wookiee.ch/conode"
Suite = "Ed25519"
Public = "a59fc58c0a445b70dcd57e01603a714a2ee99c1cc14ca71780383abada5d7143"
Description = "Wookiee's Cothority"
[servers.Services]
 [servers.Services.ByzCoin]
   Public = "70c192537778a53abb9315979f48e170da9182b324c7974462cbdde90fc0c51d440e2de266a81fe7a3d9d2b6665ef07ba3bbe8df027af9b8a3b4ea6569d7f72a41f0dfe4dc222aa8fd4c99ced2212d7d1711267f66293732c88e8d43a2cf6b3e2e1cd0c57b8f222a73a393e70cf81e53a0ce8ed2a426e3b0fa6b0da30ff27b1a"
   Suite = "bn256.adapter"
 [servers.Services.Skipchain]
   Public = "63e2ed93333bd0888ed2b5e51b5e2544831b4d79dead571cf67604cdd96bc0212f68e582468267697403d7ed418e70ed9fcb01940e4c603373994ef00c04542c24091939bddca515381e0285ab805826cec457346be482e687475a973a20fca48f16c76e352076ccc0c866d7abb3ac50d02f9874d065f85404a0127efc1acf49"
   Suite = "bn256.adapter"`
