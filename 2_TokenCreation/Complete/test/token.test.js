// Replace the values below with yours ;)
const tokenName = "SoatToken";
const initialSupply = 13370000;
const amount = 10;
//

const token = artifacts.require("./" + tokenName + ".sol");

contract(tokenName, async (accounts) => {

  it(`should have put ${initialSupply} ${tokenName} in the first account`, async () => {
    let instance = await token.deployed();
    let balance = await instance.balanceOf.call(accounts[0]);
    var amount = token.web3.fromWei(balance, "ether");
    assert.equal(amount.toNumber(), 13370000);
  })

  it(`should send ${amount} ${tokenName} correctly from owner account (0) to another one (without approval)`, async () => {
    let account_one = accounts[0];
    let account_two = accounts[1];

    let instance = await token.deployed();

    let balance = await instance.balanceOf.call(account_one);
    let account_one_starting_balance = balance.toNumber();

    balance = await instance.balanceOf.call(account_two);
    let account_two_starting_balance = balance.toNumber();
    await instance.transfer(account_two, amount, {
      from: account_one
    });

    balance = await instance.balanceOf.call(account_one);
    let account_one_ending_balance = balance.toNumber();

    balance = await instance.balanceOf.call(account_two);
    let account_two_ending_balance = balance.toNumber();

    assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
  });

  it(`sould send ${amount} ${tokenName} from an account to another (with approval!)`, async () => {
    let account_one = accounts[0];
    let account_two = accounts[1];
    let account_three = accounts[2];

    let instance = await token.deployed();

    await instance.transfer(account_two, amount, {
      from: account_one
    });

    await instance.approve(account_three, amount, {
      from: account_two
    });

    let allowance = await instance.allowance.call(account_two, account_three);
    assert.equal(allowance, amount, `Account three should be allowed to collect ${amount} ${tokenName} from account two.`)

    await instance.transferFrom(account_two, account_three, amount, {
      from: account_three
    });

    let account_three_ending_balance = await instance.balanceOf.call(account_three);
    account_three_ending_balance = account_three_ending_balance.toNumber();

    assert.equal(account_three_ending_balance, amount, `Account three should have received ${amount} ${tokenName} - Got ${account_three_ending_balance}`)
  });
});