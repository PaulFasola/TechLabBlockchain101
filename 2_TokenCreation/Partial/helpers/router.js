const util = require('util');
const rlsync = require('readline-sync');
const exec = util.promisify(require('child_process').exec);

const scripts = [{
        label: "Read account balances",
        file: "read-balances.js"
    },
    {
        label: "Send any amount of tokens from the owner account to the nearest one",
        file: "send-tokens-from-owner.js",
        prerequisites: ["askForAmmount"]
    },
    {
        label: "Send any amount of tokens from an account to another",
        file: "send-tokens-custom.js",
        prerequisites: ["askForSender", "askForReceiver", "askForAmmount"]
    },
];

getParamsFromPrerequisites = (prerequisites) => {
    var inlineParams = " ";

    if (prerequisites == null) {
        return "";
    }

    prerequisites.forEach((prerequisite) => {
        if (prerequisite == "askForAmmount") {
            var answer = rlsync.question("\nAmount of tokens to send ? (1 by default)> ");
            if (parseInt(answer) !== NaN || answer.length === 0) {
                inlineParams += " --amount " + ((answer.length === 0) ? 1 : answer);
            } else {
                console.log("Invalid : the provided amount is not a number.");
            }
        } else if (prerequisite == "askForSender") {
            var answer = rlsync.question("\nSender wallet ID ?> ");
            answer = parseInt(answer);
            if (answer !== NaN && answer >= 0 && answer <= answer + 1) {
                inlineParams += " --sender " + answer;
            } else {
                console.log("Invalid sender wallet ID.");
            }
        } else if (prerequisite == "askForReceiver") {
            var answer = rlsync.question("\nReceiver wallet address ID ?> ");
            if (answer !== NaN && answer >= 0 && answer <= answer + 1) {
                inlineParams += " --receiver " + answer;
            } else {
                console.log("Invalid receiver wallet ID.");
            }
        } else {
            throw "Prerequisite '" + prerequisite + "' is not implemented.";
        }
    });

    return inlineParams;
};
 
ask = async () => {
    var childProcessParameters = "";
    console.log("Techlab Helpers\n==============");
    scripts.map((o, i) => console.log(i + " -> " + o.label));

    var answer = rlsync.question("\nChoice ? (q to quit)> ");

    if (answer !== "q") {
        if (parseInt(answer) === NaN || scripts[answer] == null) {
            console.log("Please enter a valid number");
        } else {
            if (scripts[answer].prerequisites != null) {
                // Since readline is ineffective when run from a sub process, 
                // let's get the infos here.
                childProcessParameters = getParamsFromPrerequisites(scripts[answer].prerequisites);
                console.log(`\nRunning truffle exec on ./helper/" ${scripts[answer].file} with the following params :${childProcessParameters}`)
            } else {
                console.log("Running truffle exec on ./helper/" + scripts[answer].file)
            }

            const {
                stdout,
                stderr
            } = await exec('truffle exec ./helpers/' + scripts[answer].file + childProcessParameters);

            console.log('stdout:', stdout);

            if (stderr.length !== 0) {
                console.log(stderr);
            }
        }
        ask();
    }
};

console.log('\x1Bc'); // console clear
ask();