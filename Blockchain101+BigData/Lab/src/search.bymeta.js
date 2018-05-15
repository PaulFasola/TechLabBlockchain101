const driver = require('bigchaindb-driver');
const sleep = require('sleep');
const program = require("commander");
const config = require('../config');

program
    .option('--search [value]', 'Search string')
    .option('--type [value]', 'Type of search')
    .parse(process.argv);

console.log();

const conn = new driver.Connection(config.API_PATH, {
    app_id: config.APP_ID,
    app_key: config.APP_KEY
});

if (program.searchType === "metadata") {
    conn.searchMetadata(program.search)
        .then(metas => {
            if (assets && assets.length > 0) {
                console.log("Number of metadata found : " + assets.length);
                console.log(assets);
            } else {
                console.log("No metadata found for this search");
            }
        });
} else if (program.searchType === "assetsByMetaData") {
    conn.searchAssets(program.search)
        .then(assets => metas.forEach(asset => {
            conn.searchAssets(meta.id)
                .then(results => {
                    if (assets && assets.length > 0) {
                        console.log("Number of assets found : " + assets.length);
                        console.log(assets);
                    } else {
                        console.log("No assets found for this search");
                    }
                });
        }));
} else {
    // Looking for assets
    conn.searchAssets(program.search)
        .then(assets => {
            if (assets && assets.length > 0) {
                console.log("Number of assets found : " + assets.length);
                console.log(assets);
            } else {
                console.log("No assets found for this search");
            }
        });
}