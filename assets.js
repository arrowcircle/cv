const path = require("path");
const glob = require("glob");

module.exports = function assets_manifest_from(metafile) {
  let assets = {};

  for (var output in metafile.outputs) {
    let nohash = output.replace("build", "")
    const arr = nohash.split(".");
    let filename = [arr.at(0)];
    if (arr.at(-1) == "map") {
      filename.push(arr.at(-2));
    }
    filename.push(arr.at(-1));
    assets[filename.join('.')] = output.replace("build", '');
  }
  return assets;
};