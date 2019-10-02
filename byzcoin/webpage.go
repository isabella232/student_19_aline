package byzcoin

import (
	"golang.org/x/crypto/blake2b"
	"net/http"
	//"golang.org/x/net/html"
	"time"
	//"io"
	"io/ioutil"
	//"bytes"

	"go.dedis.ch/cothority/v3/byzcoin"
	"go.dedis.ch/cothority/v3/darc"
	"go.dedis.ch/protobuf"
	//newstuff
	//"bytes"
	//"fmt"
	//"io"
	//"github.com/antchfx/xpath"
	//"golang.org/x/net/html/charset"
)

var ContractWebPageID = "webPage"

type contractWebPage struct {
	byzcoin.BasicContract
	ContractWebPageData
}

func contractDataFromBytes(in []byte) (byzcoin.Contract, error) {
	cv := &contractWebPage{}
	err := protobuf.Decode(in, &cv.ContractWebPageData)
	if err != nil {
		return nil, err
	}
	return cv, nil
}

func (c *contractWebPage) Spawn(rst byzcoin.ReadOnlyStateTrie, inst byzcoin.Instruction, coins []byzcoin.Coin) (sc []byzcoin.StateChange, cout []byzcoin.Coin, err error) {
	cout = coins

	// Find the darcID for this instance
	var darcID darc.ID
	_, _, _, darcID, err = rst.GetValues(inst.InstanceID.Slice())
	if err != nil {
		return
	}

	// Extract the URL from inst.Spawn.Args
	URLArg := string(inst.Spawn.Args.Search("URLWebPage"))
	cs := &c.ContractWebPageData

	// Store the URL of the page in the contract
	cs.URLWebPage = URLArg

	// Extract the content of the page
	var transport http.RoundTripper = &http.Transport{
		DisableKeepAlives: true, // To avoid Goroutine leakages
	}

	client := &http.Client{Transport: transport}
	resp, _ := client.Get(URLArg)
	content, _ := ioutil.ReadAll(resp.Body)

	// Store the hashed content of the page, the date and the selector in the contract
	cs.Content = blake2b.Sum256(content)
	cs.CreationDate = time.Now().Format("01-02-2006")
	cs.Selector = "abcdefghijklmnop"

	// Put the data into our struct
	csBuf, err := protobuf.Encode(&c.ContractWebPageData)
	if err != nil {
		return
	}

	// Create a StateChange request with the data of the instance
	sc = []byzcoin.StateChange{
		byzcoin.NewStateChange(byzcoin.Create, inst.DeriveID(""), ContractWebPageID, csBuf, darcID),
	}
	return
}

func (c *contractWebPage) Delete(rst byzcoin.ReadOnlyStateTrie, inst byzcoin.Instruction, coins []byzcoin.Coin) (sc []byzcoin.StateChange, cout []byzcoin.Coin, err error) {
	cout = coins
	var darcID darc.ID
	_, _, _, darcID, err = rst.GetValues(inst.InstanceID.Slice())
	if err != nil {
		return
	}

	// Delete removes all the data from the global state.
	sc = byzcoin.StateChanges{byzcoin.NewStateChange(byzcoin.Remove, inst.InstanceID, ContractWebPageID, nil, darcID)}
	return
}
