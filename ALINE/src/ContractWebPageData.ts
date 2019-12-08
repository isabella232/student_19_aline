import { addJSON, EMPTY_BUFFER, registerMessage } from "@dedis/cothority/protobuf";
import models from "../src/protobuf/models.json";
import { Message, Properties } from "protobufjs/light";

/**
 * This class declares a message to encode/decode the content of a webPage
 * instance, namely a ContractWebPageData struct.
 */
export class ContractWebPageData extends Message<ContractWebPageData> {
    URLWebPage: string;
    HashedContent: Buffer;
    Content: string;
    Selector: string;
    CreationDate: string;
    TextOnly: boolean;

    constructor(props?: Properties<ContractWebPageData>) {
        super(props);

        this.URLWebPage = this.URLWebPage || "No URL has been found.";
        this.HashedContent = Buffer.from(this.HashedContent || EMPTY_BUFFER);
        this.Content = this.Content|| "No content has been found";
        this.Selector = this.Selector|| "No selector has been found";
        this.CreationDate = this.CreationDate || "No creation date has been found";
        this.TextOnly = this.TextOnly || true;

    }

    static register() {
        registerMessage("ContractWebPageData", ContractWebPageData);
    }

    toString(): string {
        var res: string = "";
        res += "contractWebPageData:\n";
        res += "\n";
        res += "URL: " + this.URLWebPage;
        res += "\n";
        res += "Hashed content: " + this.HashedContent.toString("hex");
        res += "\n";
        res += "Selector: " + this.Selector;
        res += "\n";
        res += "Creation Date: " + this.CreationDate;
        res += "\n";
        res += "Text Only: " + this.TextOnly;
        res += "\n";
        return res;
    }

    toStringForUsers(): string {
        var res: string = "Attestation that this online content existed :";
        res += "\n";
        res += "URL: " + this.URLWebPage;
        res += "\n";
        res += "Hashed content: " + this.HashedContent.toString("hex");
        res += "\n";
        res += "Selector: " + this.Selector;
        res += "\n";
        res += "Creation Date: " + this.CreationDate;
        res += "\n";
        res += "Text Only: " + this.TextOnly;
        res += "\n";
        return res;
    }
}

// Here we update the model with our models.json containing the definition of
// the ContractWebPageData and we register our messages classes, so that protobuf can
// encore and decode it.
addJSON(models)
ContractWebPageData.register()
