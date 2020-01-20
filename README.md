<a href="https://cla-assistant.io/dedis/student_19_aline"><img src="https://cla-assistant.io/readme/badge/dedis/student_19_aline" alt="CLA assistant" /></a>

# student_19_aline

This project consists of, first, writing a smart contract in Go that communicates with cothority and secondly, writing a plugin that uses this smart contract to allow internet users to certify some webpage content. The name of this plugin is
**ALINE**, standing for **A**ttestation that On**line** Content Existed.

- The smart contract can be found at this path : `cothority_webpage_contract/byzcoin/webpage.go` (and its corresponding attributes and test files, `proto.go` and `webpage_test.go` respectively)
- The plugin, a Chrome extension, can be found in the folder named `ALINE`.

## How to use ALINE

<img src="./ALINE/icon.png" alt="drawing" width="100"/>

### Start the conodes

```bash

$ cd cothority_webpage_contract/conode

$ go build

$ ./run_nodes.sh -d tmp -v 3

```

### Initialize the skip chain

```bash

$ bcadmin create cothority_webpage_contract/conode/tmp/public.toml

$ export BC=<ABSOLUTE PATH OF FILE PUBLIC.TOML>

$ bcadmin darc rule -rule spawn:webPage -id <USER_KEY>

$ bcadmin key —print <USER_KEY>

```

Then set the skip chain id and the private key variables in BOTH places in `ALINE/src/AlineFeatures.ts`

### Build the plugin

```bash

$ cd ALINE

$ npm install

$ npm run protobuf

$ npm run build

```

### Load the plugin

In your Chrome browser, go to `chrome://extensions/` and select “Load unpacked”. There you can load the `ALINE/` folder.

### Use the plugin

Once the previous step performed, you just have to click on the icon in the right up-corner of your screen while being on the webpage you want to certify.
