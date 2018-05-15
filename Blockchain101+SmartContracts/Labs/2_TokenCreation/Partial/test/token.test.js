
// TODO : Replace the values below with yours ;)
const tokenName = "";
const initialSupply = 0;
const amount = 0;
//

const token = artifacts.require("./" + tokenName + ".sol");

contract(tokenName, async (accounts) => {

  it(`should have put ${initialSupply} ${tokenName} in the first account`, async () => {
    /*
      TODO : we need this test!
    */
  })

  it(`should send ${amount} ${tokenName} correctly from owner account (0) to another one (without approval)`, async () => {
    /*
      TODO : we need this test!
    */
  });

  it(`sould send ${amount} ${tokenName} from an account to another (with approval!)`, async () => {
    /*
      TODO : we need this test!
    */
  });

});