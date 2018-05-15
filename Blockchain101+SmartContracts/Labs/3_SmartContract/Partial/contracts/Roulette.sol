pragma solidity 0.4.23;


contract Roulette {
    uint public nextRoundTimestamp;
    uint private _interval;
    address private _owner;
    uint private _bet_identifier;

    enum BetType { Single, Odd, Even }

    struct Bet {
        uint id;
        BetType betType;
        address player;
        uint number;
        uint value;
    }

    Bet[] public bets;

    event Resulted(uint number, uint nextRoundTimestamp, uint wonAmount);
    event NewSingleBet(uint betId, address player, uint number, uint value);
    event NewEvenBet(uint betId, address player, uint value);
    event NewOddBet(uint betId, address player, uint value);

    constructor(uint interval) public payable {
        _interval = interval;
        _owner = msg.sender;
        nextRoundTimestamp = now + _interval;
    }

    function getNextRoundTimestamp() public constant returns(uint) {
        return nextRoundTimestamp;
    }

    function getBetsLength() public constant returns(uint) {
         return bets.length;
    }

    function getBetAt(uint index) public constant returns(uint betId, address player, uint number, uint value, uint betType) {
        if(bets.length <= index) revert();
        if(bets[index].betType == BetType.Even){
            betType = 38;
        } else if(bets[index].betType == BetType.Odd){
            betType = 39;
        } else{
            betType = 0;
        }
        return (bets[index].id, bets[index].player, bets[index].number, bets[index].value, betType);
    }

    function betSingle(uint number) {
        // TODO !
    }

    function betEven() {
        // TODO !
    }

    function betOdd() {
        // TODO !
    }

    function launch() public payable {
        // TODO !

        // This is a pseudo-random number generator
        // This is highly predictable so don't prod this ;) 
        uint number = uint(blockhash(block.number - 1)) % 37;
        uint won_amount = 0;

        for (uint i = 0; i < bets.length; i++) {
            bool won = false;

            if (bets[i].betType == BetType.Single) {
                if (bets[i].number == number) {
                    won = true;
                }
            } else if (bets[i].betType == BetType.Even) {
                if (number > 0 && number % 2 == 0) {
                    won = true;
                }
            } else if (bets[i].betType == BetType.Odd) {
                if (number > 0 && number % 2 == 1) {
                    won = true;
                }
            }

            if (won) {
               won_amount += bets[i].value * getPayoutForType(bets[i].betType);
               bets[i].player.transfer(won_amount);
            }
        }

        uint thisRoundTimestamp = nextRoundTimestamp;
        nextRoundTimestamp = thisRoundTimestamp + _interval;

        bets.length = 0;

        // TODO !
    }

    function getPayoutForType(BetType betType) public pure returns(uint) {
        if (betType == BetType.Single) return 35;
        else return 2;
    }

    modifier transactionMustContainEther() {
        // TODO !
    }

    modifier bankMustBeAbleToPayForBetType(BetType betType) {
        uint necessaryBalance = 0;
        for (uint i = 0; i < bets.length; i++) {
            necessaryBalance += getPayoutForType(bets[i].betType) * bets[i].value;
        }
        necessaryBalance += getPayoutForType(betType) * msg.value;
        uint currentBalance = address(this).balance;
        if (necessaryBalance > currentBalance) revert();
        _;
    }
}