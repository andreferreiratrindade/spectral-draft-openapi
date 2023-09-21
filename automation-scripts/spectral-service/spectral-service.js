import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { join } from "path";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import spectralRuntime from "@stoplight/spectral-runtime";
import { exit } from "node:process";

const { fetch } = spectralRuntime;
const swagger_path = "/../../swagger-apis/";
const api_path = process.argv[2]
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const full_api_path = __dirname + swagger_path +  api_path
const valition_path = "/../../swagger-validations/"
const validatio_with_api_path = __dirname+ valition_path + api_path.replace(".yml", ".json")
const validation_path_folder_api = __dirname+ valition_path + api_path.split('/')[0]
if(!fs.existsSync(full_api_path)){
    console.log("Erro -- Not exists path: " + full_api_path)
    process.exit(0)
}

const myDocument = new Document(
  // load an API specification file from your project's root directory. You can use the openapi.yaml example from here: https://github.com/stoplightio/Public-APIs/blob/master/reference/plaid/openapi.yaml
  fs.readFileSync(full_api_path, "utf-8").trim(),
  Parsers.Yaml,
  api_path,
);

const spectral = new Spectral();
// load a ruleset file from your project's root directory.
const rulesetFilepath = path.join(__dirname, ".spectral.yaml");
spectral.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));

const result = await spectral.run(myDocument);

try {

    if (!fs.existsSync(validation_path_folder_api)){
        fs.mkdirSync(validation_path_folder_api, { recursive: true });
    }
    fs.writeFileSync(validatio_with_api_path, JSON.stringify(result));
    // file written successfully
  } catch (err) {
    console.error(err);
  }