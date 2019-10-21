package byzcoin

type ContractWebPageData struct {
	URLWebPage string
	Content [32]byte
	Selector string
	CreationDate string
	TextOnly int
}

type ContractWebPageArgs struct {
	URLWebPage string
	Selector string
	TextOnly int
}
