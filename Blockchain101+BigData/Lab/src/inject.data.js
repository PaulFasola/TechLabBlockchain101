const uuid = require('uuid');
const faker = require('faker');
const sleep = require('sleep');
const driver = require('bigchaindb-driver')
const config = require('../config')
const program = require("commander");

program
    .option('--type [value]', 'Type of data to inject')
    .parse(process.argv);

// Create a new keypair.
const keypair = new driver.Ed25519Keypair()

function inject() {
    let _key = uuid();
    let assetToInsert = null;
    let meta = null;

    if(program.type === 'orders'){
        assetToInsert = {
            key: _key,
            FirstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            orders: [{
                name: faker.commerce.productName(),
                color: faker.commerce.product.color,
                company: faker.company.companyName(),
                price: faker.commerce.product.price
            }]
        };
        meta = 'Clients and orders';
    } else{
        assetToInsert = {
            key: _key,
            FirstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            avatar: faker.internet.avatar,
            userName: faker.internet.userName,
            password: faker.internet.password
        };
        meta = 'Website accounts';
    }

    // Construct a transaction payload
    const tx = driver.Transaction.makeCreateTransaction(

        // The assets to store
        assetToInsert,

        // Metadata contains information about the transaction itself
        // (can be `null` if not needed)
        {
            what: meta
        },

        // A transaction needs an output
        [driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(keypair.publicKey))],
        keypair.publicKey
    )

    console.log(config.consoleColors.lightcyan, JSON.stringify(tx));

    // Sign the transaction with private keys
    const txSigned = driver.Transaction.signTransaction(tx, keypair.privateKey);

    // Send the transaction off to BigchainDB
    const conn = new driver.Connection(config.API_PATH, {
        app_id: config.APP_ID,
        app_key: config.APP_KEY
    })

    sleep.sleep(2);

    conn.postTransactionCommit(txSigned)
        .then(retrievedTx => console.log(config.consoleColors.green, 'Transaction', retrievedTx.id, 'successfully posted.'))
        .then(() => inject());
}

inject();