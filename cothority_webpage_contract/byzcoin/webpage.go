package byzcoin

import (
	"net/http"
	"time"

	"github.com/PuerkitoBio/goquery"
	"go.dedis.ch/cothority/v3/byzcoin"
	"go.dedis.ch/cothority/v3/darc"
	"go.dedis.ch/protobuf"
	"golang.org/x/crypto/blake2b"
	"golang.org/x/xerrors"
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

func (c *contractWebPage) Spawn(rst byzcoin.ReadOnlyStateTrie, inst byzcoin.Instruction, coins []byzcoin.Coin) ([]byzcoin.StateChange, []byzcoin.Coin, error) {
	cout := coins

	// Find the darcID for this instance
	var darcID darc.ID
	_, _, _, darcID, err := rst.GetValues(inst.InstanceID.Slice())
	if err != nil {
		return nil, nil, xerrors.Errorf("failed to get the darc ID: %v", err)
	}

	// Extract arguments from inst.Spawn.Args
	webPageArgs := ContractWebPageData{}
	webPageArgsBuff := inst.Spawn.Args.Search("webPageArgs")
	if webPageArgsBuff == nil {
		return nil, nil, xerrors.Errorf("webPageArgs not found")
	}
	err = protobuf.Decode(webPageArgsBuff, &webPageArgs)
	if err != nil {
		return nil, nil, xerrors.Errorf("failed to get webPageArgs: %v", err)
	}

	// Extract the URL from inst.Spawn.Args
	URLArg := webPageArgs.URLWebPage

	// Store the URL of the page in the contract
	cs := &c.ContractWebPageData
	cs.URLWebPage = URLArg

	// Extract the selected content of the page using the selector

	// Set up the connection
	var transport http.RoundTripper = &http.Transport{
		DisableKeepAlives: true, // To avoid Goroutine leakages
	}

	client := &http.Client{Transport: transport}
	resp, err := client.Get(URLArg)
	if err != nil {
		return nil, nil, xerrors.Errorf("failed to get the client: %v", err)
	}
	// Load the HTML document
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, nil, xerrors.Errorf("failed to create query: %v", err)
	}

	// Find the desired section with the CSS selector
	selector := webPageArgs.Selector
	var content string

	selection := doc.Find(selector).First()

	textOnly := webPageArgs.TextOnly

	if textOnly {
		content = selection.Text()
	} else {
		content, err = selection.Html()
		if err != nil {
			return nil, nil, xerrors.Errorf("failed to get HTML selection: %v", err)
		}
	}

	// Store the hashed content of the page, the date and the selector in the contract
	hashedContent := blake2b.Sum256([]byte(content))
	cs.Content = hashedContent[:]
	cs.CreationDate = time.Now().Format("01-02-2006")
	cs.Selector = selector
	cs.TextOnly = textOnly

	// Put the data into our struct
	csBuf, err := protobuf.Encode(&c.ContractWebPageData)
	if err != nil {
		return nil, nil, xerrors.Errorf("failed to encode contractWebPageData: %v", err)
	}

	// Create a StateChange request with the data of the instance
	sc := []byzcoin.StateChange{
		byzcoin.NewStateChange(byzcoin.Create, inst.DeriveID(""), ContractWebPageID, csBuf, darcID),
	}
	return sc, cout, nil
}

func (c *contractWebPage) Delete(rst byzcoin.ReadOnlyStateTrie, inst byzcoin.Instruction, coins []byzcoin.Coin) (sc []byzcoin.StateChange, cout []byzcoin.Coin, err error) {
	cout = coins
	var darcID darc.ID
	_, _, _, darcID, err = rst.GetValues(inst.InstanceID.Slice())
	if err != nil {
		return
	}

	// Delete removes all the data from the global state
	sc = byzcoin.StateChanges{byzcoin.NewStateChange(byzcoin.Remove, inst.InstanceID, ContractWebPageID, nil, darcID)}
	return
}
