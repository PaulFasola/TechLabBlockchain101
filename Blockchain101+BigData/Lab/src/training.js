const faker = require('faker');
const driver = require('bigchaindb-driver')
const config = require('../config');    

const conn = new driver.Connection(config.API_PATH, {
    app_id: config.APP_ID,
    app_key: config.APP_KEY
});
 
// Create a new keypair for Alice and Bob
const alice = new driver.Ed25519Keypair();
const bob = new driver.Ed25519Keypair();

console.log('Alice: ', alice.publicKey);
console.log('Bob: ', bob.publicKey);

const bike_sn = faker.random.number(999900000);
const manufacturer = "<>";

// Define the asset to store, in this example
// we store a bicycle with its serial number and manufacturer
const assetdata = {
        'bicycle': {
                'serial_number': bike_sn,
                'manufacturer': manufacturer
        }
};

// Metadata contains information about the transaction itself
// (can be `null` if not needed)
// E.g. the bicycle is a sport one
const metadata = {'type': 'sport'};

// Construct a transaction payload
const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
        assetdata,
        metadata,

        // A transaction needs an output
        [ driver.Transaction.makeOutput(
                        driver.Transaction.makeEd25519Condition(alice.publicKey))
        ],
        alice.publicKey
);

// Sign the transaction with private keys of Alice to fulfill it 
const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)
 
conn.postTransactionCommit(txCreateAliceSimpleSigned)
        .then(retrievedTx => console.log('Transaction', retrievedTx.id, 'successfully posted.'))
        // With the postTransactionCommit if the response is correct, then the transaction
        // is valid and commited to a block

        // Transfer bicycle to Bob
        .then(() => {
                const txTransferBob = driver.Transaction.makeTransferTransaction(
                        // signedTx to transfer and output index
                        [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
                        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
                        // metadata
                        {price: '100 euro', tx_date: new Date() }
                )

                // Sign with alice's private key
                let txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
                console.log('Posting signed transaction: ', txTransferBobSigned)

                // Post with commit so transaction is validated and included in a block
                return conn.postTransactionCommit(txTransferBobSigned)
        })
        .then(res => {
                console.log('Response from BDB server:', res) 
                return res;
        })
        .then(tx => {
                console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == bob.publicKey);
                console.log('Was Alice the previous owner?', tx['inputs'][0]['owners_before'][0] == alice.publicKey );
        }) 
        .then(() => conn.searchAssets(manufacturer))
        .then(assets => console.log('Found assets: ', assets)); 