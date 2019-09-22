package byzcoin

import (
	//"errors"
	"net/http"
	"golang.org/x/net/html"

	"go.dedis.ch/cothority/v3/byzcoin"
	"go.dedis.ch/cothority/v3/darc"
	"go.dedis.ch/protobuf"
)

var ContractWebPageID = "webPage"

type contractWebPage struct {
	byzcoin.BasicContract
	URLWebPage []byte
	content []byte

}

func contractValueFromBytes(in []byte) (byzcoin.Contract, error) {
	cv := &contractWebPage{}
	err := protobuf.Decode(in, &cv.URLWebPage)
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

	// Put the stuff from the inst.Spawn.Args into our KeyValueData structure.
	/*cs := &c.URLWebPage
	for _, kv := range inst.Spawn.Args {
		cs.Storage = append(cs.Storage, KeyValue{kv.Name, kv.Value})
	}

	csBuf, err := protobuf.Encode(&c.URLWebPage)
	if err != nil {
		return
	}*/

	// Then create a StateChange request with the data of the instance. The
	// InstanceID is given by the DeriveID method of the instruction that allows
	// to create multiple instanceIDs out of a given instruction in a pseudo-
	// random way that will be the same for all nodes.
	sc = []byzcoin.StateChange{
		byzcoin.NewStateChange(byzcoin.Create, inst.DeriveID(""), ContractWebPageID, inst.Spawn.Args.Search("URLWebPage"), darcID),
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
