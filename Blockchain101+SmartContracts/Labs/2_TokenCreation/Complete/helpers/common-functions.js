'use strict';

var contractHelper = {
    instance: {},
    web3: {},

    bind: (contractInstanceHook, web3Hook) => {
        contractHelper.instance = contractInstanceHook;
        contractHelper.web3 = web3Hook;
    },

    getBalances: async () => {
        var balances = [];

        if (contractHelper.web3.eth === undefined) {
            return balances;
        }

        await Promise.all(
            contractHelper.web3.eth.accounts.map(
                (account, i) => {
                    return contractHelper.instance.balanceOf(account).then((balance) => {
                        balances.push({
                            account: account,
                            balance: balance
                        });
                    })
                })
        );

        return balances;
    },

    getWalletByKey: async (key) => {
        // TODO: /
        var balances = await contractHelper.getBalances(); 
        // here, we just need the wallet address.
        return balances[key] ? balances[key].account : null;
    },

    getBalance: (instance, address) => {
        return instance.balanceOf(address);
    }
}

module.exports = contractHelper;