package byzcoin

import (
	"golang.org/x/crypto/blake2b"
	"io/ioutil"
	"net/http"
	"testing"
	"time"
	//"golang.org/x/net/html"

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

	// Get the URL
	URLArg := []byte("http://www.mlppreservationproject.com/")

	// Get the content
	var transport http.RoundTripper = &http.Transport{
		DisableKeepAlives: true, // to avoid Goroutine leakages
	}

	client := &http.Client{Transport: transport}
	resp, _ := client.Get(string(URLArg))
	content, _ := ioutil.ReadAll(resp.Body)

	// Hash this content
	hashedContent := blake2b.Sum256(content)

	// Get the current date
	formattedDate := []byte(time.Now().Format("01-02-2006"))

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

	// Poll the blockchain to get a proof for our new instance
	pr, err := cl.WaitProof(byzcoin.NewInstanceID(ctx.Instructions[0].DeriveID("").Slice()), 2*genesisMsg.BlockInterval, nil)
	require.Nil(t, err)

	// Check the proof to ensure the instance is created
	require.True(t, pr.InclusionProof.Match(ctx.Instructions[0].DeriveID("").Slice()))

	// Get the encoded content of the contract in the form of a byte slice
	resultBuf, _, _, err := pr.Get(ctx.Instructions[0].DeriveID("").Slice())
	require.Nil(t, err)

	// Initialize en empty struct so the resultBuf can be decoded into it
	result := ContractWebPageData{}

	// Deserialize the byte slice we received into our empty struct
	err = protobuf.Decode(resultBuf, &result)
	require.Nil(t, err)

	// Check if our struct result.Storage contains the correct number of elements
	require.Equal(t, 3, len(result.Storage))

	// Check the 1st key value
	require.Equal(t, "URLWebPage", result.Storage[0].Key)
	require.Equal(t, URLArg, result.Storage[0].Value)

	// Check the 2nd key value
	require.Equal(t, "content", result.Storage[1].Key)
	require.Equal(t, hashedContent[:], result.Storage[1].Value)

	// Check the 3rd key value
	require.Equal(t, "date", result.Storage[2].Key)
	require.Equal(t, formattedDate, result.Storage[2].Value)

	local.WaitDone(genesisMsg.BlockInterval)

}
