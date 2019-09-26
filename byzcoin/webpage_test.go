package byzcoin

import (
	"testing"
	"time"
	//"io/ioutil"
	//"net/http"

	"github.com/stretchr/testify/require"
	"go.dedis.ch/cothority/v3"
	"go.dedis.ch/cothority/v3/byzcoin"
	"go.dedis.ch/cothority/v3/darc"
	"go.dedis.ch/onet/v3"
	"go.dedis.ch/protobuf"
)

func TestValue_Spawn(t *testing.T) {
	local := onet.NewTCPTest(cothority.Suite)
	defer local.CloseAll()

	signer := darc.NewSignerEd25519(nil, nil)
	_, roster, _ := local.GenTree(3, true)

	genesisMsg, err := byzcoin.DefaultGenesisMsg(byzcoin.CurrentVersion, roster,
		[]string{"spawn:webPage"}, signer.Identity())
	require.Nil(t, err)
	gDarc := &genesisMsg.GenesisDarc

	genesisMsg.BlockInterval = time.Second

	cl, _, err := byzcoin.NewLedger(genesisMsg, false)
	require.Nil(t, err)

	URLArg := []byte("http://www.mlppreservationproject.com/")
//	resp, _ := http.Get(string(URLArg))
	//content, _ := ioutil.ReadAll(resp.Body)

	ctx, err := cl.CreateTransaction(byzcoin.Instruction{
		InstanceID: byzcoin.NewInstanceID(gDarc.GetBaseID()),
		Spawn: &byzcoin.Spawn{
			ContractID: ContractWebPageID,
			Args: []byzcoin.Argument{{
				Name:  "URLWebPage",
				Value: URLArg,
			}},
		},
		SignerCounter: []uint64{1},
	})
	require.NoError(t, err)
	require.Nil(t, ctx.FillSignersAndSignWith(signer))

	_, err = cl.AddTransaction(ctx)
	require.Nil(t, err)

	local.WaitDone(genesisMsg.BlockInterval)

	// Polls the blockchain to get a proof for our new instance
	pr, err := cl.WaitProof(byzcoin.NewInstanceID(ctx.Instructions[0].DeriveID("").Slice()), 2*genesisMsg.BlockInterval, nil)
	require.Nil(t, err)

	// Checks the proof to ensure the instance is created
	require.True(t, pr.InclusionProof.Match(ctx.Instructions[0].DeriveID("").Slice()))

	// Gets the encoded content of the contract in the form of a byte slice
	resultBuf, _, _, err := pr.Get(ctx.Instructions[0].DeriveID("").Slice())
	require.Nil(t, err)

	// Initializes en empty struct so the resultBuf can be decoded into it
	result := ContractWebPageData{}

	// Deserializes the byte slice we received into our empty struct
	err = protobuf.Decode(resultBuf, &result)
	require.Nil(t, err)

	// Now let's check the content of our struct
	// result.Storage should contain two KeyValue elements
	require.Equal(t, 1, len(result.Storage))

	// Checks the first key value
	require.Equal(t, "URLWebPage", result.Storage[0].Key)
	require.Equal(t, URLArg, result.Storage[0].Value)

	// Checks the second key value
	//require.Equal(t, "content", result.Storage[1].Key)
	//require.Equal(t, content, result.Storage[1].Value)

	local.WaitDone(genesisMsg.BlockInterval)

}
