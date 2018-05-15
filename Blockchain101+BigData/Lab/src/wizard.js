const chalk = require('chalk');
const open = require('open');
const readline = require('readline');
const exec = require('child_process').exec;

const CTRL_C = '\u0003';
const stdin = process.stdin;

const startWaitingForCommand = () => {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', handleKeypress);
};

const stopWaitingForCommand = () => {
    stdin.removeListener('data', handleKeypress);
    stdin.setRawMode(false);
    stdin.resume();
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let isInteractive = false;
if (typeof stdin.setRawMode === 'function') {
    startWaitingForCommand();
    isInteractive = true;
    clearConsole()
    printUsage();
}

function clearConsole() {
    process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
    process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0); 
}

const cleanup = () => {
    rl.close();
    process.stdin.removeListener('keypress', handleKeypress);
    startWaitingForCommand();
};

function printUsage() {
    if (!isInteractive) {
        return;
    }

    console.log(`
        ${chalk.bold('TechLabs by Soat - Blockchain + BigData')}
        ${chalk.bold('')}
        ${chalk.bold('= BigChain DB injection')}
        ${chalk.dim(`\u203A Press`)} 1 ${chalk.dim(`to inject random customers with products into your BigChain database`)}
        ${chalk.dim(`\u203A Press`)} 2 ${chalk.dim(`to inject random accounts into your BigChain database`)}
        ${chalk.bold('')}
        ${chalk.bold('= Lookup')}
        ${chalk.dim(`\u203A Press`)} a ${chalk.dim(`to lookup for assets`)}
        ${chalk.dim(`\u203A Press`)} b ${chalk.dim(`to lookup for meta data`)}
        ${chalk.dim(`\u203A Press`)} c ${chalk.dim(`to lookup for assets by meta data`)}
        ${chalk.bold('')}
        ${chalk.dim(`\u203A Press`)} t ${chalk.dim(`See a Tx details on the BigChainDB TestNet`)}
        ${chalk.dim(`\u203A Press`)} g ${chalk.dim(`to open the meetup Github Repository`)}
    `);
}

function injectData(type) {
    if (type === 'customers' || type === 'accounts') {
        var child = exec('node ./src/inject.data --type ' + type);
        child.stdout.on('data', function (data) {
            process.stdout.write(data.toString());
        });

        child.on('exit', function () {
            cleanup();
            printUsage();
        });
    }
}

function lookup(type) {
    if (type === 'metadata' || type === 'assets' || type === 'assetsByMetaData') {
        const handleKeypress = (chr, key) => {
            if (key && key.name === 'escape') {
                cleanup();
                cancel();
            }
        };

        const cancel = () => {
            clearConsole();
            printUsage();
        };

        clearConsole();
        process.stdin.addListener('keypress', handleKeypress);

        console.log('Please enter your search (press ESC to cancel) ');

        rl.question('> ', answer => {
            if (!answer) {
                cancel();
                return;
            }

            answer = answer.slice(0, -1);

            console.log("Please wait, looking for '" + answer + "' (can take a minute)")
            var child = exec('node ./src/search.bymeta --search ' + answer + " --type " + type);
            child.stdout.on('data', function (data) {
                process.stdout.write(data.toString());
            });
            child.on('exit', function () {
                cleanup();
                printUsage();
            }); 
        });
    }
}

async function handleKeypress(key) {
    switch (key) {
        case CTRL_C:
            process.kill(process.pid, 'SIGINT').
            return;

        case '1':
            {
                clearConsole();
                injectData('customers');
                return;
            }

        case '2':
            {
                clearConsole();
                injectData('accounts');
                return;
            }

        case 'a':
            {
                clearConsole();
                stopWaitingForCommand();
                lookup("assets");
                return;
            }

        case 'b':
            {
                clearConsole();
                stopWaitingForCommand();
                lookup("metadata");
                return;
            }

        case 'c':
            {
                clearConsole();
                stopWaitingForCommand();
                lookup("assetsByMetaData");
                return;
            }

        case 't':
            {
                stopWaitingForCommand();
                clearConsole();
                console.log("Transaction ?"); 
                rl.question('> ', tx => {
                    if (!tx) {
                        return;
                    } else {
                        open('https://test.bigchaindb.com/api/v1/transactions/' + tx.slice(0, -1));
                        rl.close();
                    }
                    cleanup();
                });
                return;
            }

        case 'g':
            {
                open('https://github.com/PaulFasola/TechLabBlockchain101/tree/master/Blockchain101%2BBigData');
                return;
            }
    }
}