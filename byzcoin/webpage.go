package byzcoin

import (
	"net/http"
	"golang.org/x/crypto/blake2b"
	"time"
	//"fmt"
	//"golang.org/x/net/html"

	"go.dedis.ch/cothority/v3/byzcoin"
	"go.dedis.ch/cothority/v3/darc"
	"go.dedis.ch/protobuf"
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
	URLArg :=  inst.Spawn.Args.Search("URLWebPage")
	cs := &c.ContractWebPageData

	// Store the URL of the page in the contract
	cs.Storage = append(cs.Storage, KeyValue{"URLWebPage", URLArg})

	// Extract the content of the page
	resp, _ := http.Get(string(URLArg))
	content  :=[]byte("jesouhaiteavoirunestringassezlonguepourmoisimafonctionhashenfincelledupackagegolangtientlaroute")
	hashedContent:= blake2b.Sum256(content)
	resp.Body.Close()

	// Store the hashed content of the page in the contract
	cs.Storage = append(cs.Storage, KeyValue{"content", hashedContent[:] })

	// Get the current date in a readable Format
	formattedDate := []byte(time.Now().Format("01-02-2006"))

	// Store the current date in the contract
	cs.Storage = append(cs.Storage, KeyValue{"date", formattedDate })

 	// Put the data into our KeyValueData structure.
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

/*func (c *contractWebPage) Invoke(rst byzcoin.ReadOnlyStateTrie, inst byzcoin.Instruction, coins []byzcoin.Coin) (sc []byzcoin.StateChange, cout []byzcoin.Coin, err error) {
	cout = coins
	var darcID darc.ID
	_, _, _, darcID, err = rst.GetValues(inst.InstanceID.Slice())
	if err != nil {
		return
	}

	if inst.Invoke.Command != "update" {
		return nil, nil, errors.New("Value contract can only update")
	}
	// The only command we can invoke is 'update' which will store the new values
	// given in the arguments in the data.
	//  1. decode the existing data
	//  2. update the data
	//  3. encode the data into protobuf again

	kvd := &c.URLWebPage
	kvd.Update(inst.Invoke.Args)
	var buf []byte
	buf, err = protobuf.Encode(kvd)
	if err != nil {
		return
	}
	sc = []byzcoin.StateChange{
		byzcoin.NewStateChange(byzcoin.Update, inst.InstanceID,
			ContractWebPageID, buf, darcID),
	}
	return
}
*/

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

// Update goes through all the arguments and:
//  - updates the value if the key already exists
//  - deletes the keyvalue if the value is empty
//  - adds a new keyValue if the key does not exist yet
/*func (cs *KeyValueData) Update(args byzcoin.Arguments) {
	for _, kv := range args {
		var updated bool
		for i, stored := range cs.Storage {
			if stored.Key == kv.Name {
				updated = true
				if kv.Value == nil || len(kv.Value) == 0 {
					cs.Storage = append(cs.Storage[0:i], cs.Storage[i+1:]...)
					break
				}
				cs.Storage[i].Value = kv.Value
			}

		}
		if !updated {
			cs.Storage = append(cs.Storage, KeyValue{kv.Name, kv.Value})
		}
	}
}*/
