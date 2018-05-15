function log(message, type) {
  if (!message || message.length === 0) {
    return;
  }

  console.log(message);

  if (typeof message === "string") {
    new Noty({
      text: message.substring(0, 65),
      type: type,
      timeout: 3200
    }).show();
  }
}

const RouletteApp = {
  last: {
    bet: 0,
    result: 0
  },
  contract: {
    ABI: null,
    instance: null
  },
  account: null,
  bets: [],
  oldBets: [],

  init: () => {
    var account = null;
    var contractABI = null;

    RouletteApp.initUITriggers();

    var oldBets = localStorage.getItem("old_bets");
    if (oldBets) {
      RouletteApp.oldBets = JSON.parse(oldBets);
    }

    $.getJSON('/artifacts/Roulette.json', function (data) {
      contractABI = data;

      RouletteApp.contract.ABI = contractABI;
      var truffleContract = TruffleContract(contractABI);
      truffleContract.setProvider(web3.currentProvider);
      truffleContract.deployed().then(function (instance) {
        RouletteApp.contract.instance = instance;

        web3.eth.getAccounts(function (err, accounts) {
          if (err != null) {
            log("There was an error fetching your accounts.");
            return;
          }

          if (accounts.length == 0) {
            log("Couldn't get any accounts ! Make sure your Ethereum client is configured correctly.");
            return;
          }

          RouletteApp.account = accounts[0];

          $("#player").text(RouletteApp.account);

          RouletteApp.watchBalance();
          RouletteApp.watchContract();
          RouletteApp.getPendingBets();
          RouletteApp.refreshOldBets();
        });
      });
    });
  },

  initUITriggers: () => {
    $('#newBet').click(function () {
      RouletteApp.newBet();
    });

    $('#spin').click(function () {
      RouletteApp.contract.instance.launch({
        from: RouletteApp.account,
        gas: 2000000
      }).then(function () {
        $("#outcome_section").hide();
        $("#spin").hide();
        $("#newBet").hide();
      }, function (error) {
        log(error.message, "error");
      });
    });

    $("#remove-bets-history").click(function () {
      RouletteApp.oldBets = [];
      RouletteApp.refreshOldBets();
    });
  },

  watchBalance: () => {
    web3.eth.getBalance(RouletteApp.account, function (error, result) {
      var value = web3.fromWei(result, "ether").toNumber();
      $("#balance").text(value.valueOf());
    });
  },

  watchContract: () => {
    RouletteApp.contract.instance.NewSingleBet(function (error, result) {
      if (error) {
        log(error.message);
      } else {
        RouletteApp.getPendingBets();
      }
    });

    RouletteApp.contract.instance.NewOddBet(function (error, result) {
      if (error) {
        log(error.message);
      } else {
        RouletteApp.getPendingBets();
      }
    });

    RouletteApp.contract.instance.NewEvenBet(function (error, result) {
      if (error) {
        log(error.message);
      } else {
        RouletteApp.getPendingBets();
      }
    });

    RouletteApp.contract.instance.Resulted(function (error, result) {
      if (error) {
        log(error.message);
      } else {

        RouletteApp.last.result = result.args.number.toNumber();

        // No bet ? No spin.
        if (RouletteApp.bets.length > 0) {
          RouletteApp.archiveBets(result);
          spinTo(result.args.number.toNumber());
        } else {
          RouletteApp.notifyResult();
        }
      }
      RouletteApp.watchBalance();
    });
  },

  addLocalBet: (result) => {
    var duplicate = $.grep(RouletteApp.bets, function (o) {
      return o.id === result.betId;
    });

    if (duplicate.length > 0) {
      return;
    }

    RouletteApp.bets.unshift({
      id: result.betId,
      player: result.player,
      type: result.type,
      number: result.number,
      amount: result.amount
    });

    RouletteApp.refreshBets();
    RouletteApp.watchBalance();
  },

  clearOldBets: () => {
    RouletteApp.oldBets = [];
  },

  archiveBets: (result) => {
    var duplicate = $.grep(RouletteApp.oldBets, function (o) {
      return o.id === result.transactionHash;
    });

    if (duplicate.length === 0) {
      RouletteApp.oldBets.unshift({
        id: result.transactionHash,
        date: new Date().toISOString(),
        player: RouletteApp.account,
        value: result.args.number.toNumber(),
        wonAmount: web3.fromWei(result.args.wonAmount.toNumber(), "ether" )
      });
    }

    RouletteApp.bets = [];
    RouletteApp.refreshBets();
  },

  refreshBets: () => {
    $("#bets").children().remove("tr:not('#no-bets')");

    if (RouletteApp.bets.length > 0) {
      $("#no-bets").addClass("collapse");
    } else {
      $("#no-bets").removeClass("collapse");
    }

    RouletteApp.bets.forEach((bet) => {
      var line = "<tr>";
      line += `<td>${bet.id}</td>`;
      line += `<td>${bet.player}</td>`;
      line += `<td>${bet.type} ${(bet.type === "Single") ? `(${bet.number})` : ''}</td>`;
      line += `<td>${bet.amount}</td>`;
      line += "</tr>";
      $("#bets").append(line);
    });
  },

  refreshOldBets: () => {
    if (RouletteApp.oldBets.length > 0) {
      $("#no-old-bets").addClass("collapse");
    } else {
      $("#no-old-bets").removeClass("collapse");
    }

    $("#oldbets").children().remove("tr:not('#no-old-bets')");

    RouletteApp.oldBets.forEach((oldBets) => {
      var line = "<tr>";
      line += `<td>${oldBets.id}</td>`;
      line += `<td>${oldBets.date}</td>`;
      line += `<td>${oldBets.player}</td>`;
      line += `<td>${oldBets.value === undefined ? "(no bet)" : oldBets.value}</td>`;
      line += `<td>${oldBets.wonAmount} ${parseInt(oldBets.wonAmount) === 0 ? "(you lost)" : "(you won!)" }</td>`;
      line += "</tr>";
      $("#oldbets").append(line);
    });
  },

  getPendingBets: () => {
    RouletteApp.contract.instance.getBetsLength().then(function (result) {
      var length = result.toNumber();

      for (var i = 0; i < length; i++) {
        RouletteApp.contract.instance.getBetAt(parseInt(i)).then(function (result) {
          var bet = {
            betId: result[0].toNumber(),
            player: result[1],
            number: parseInt(result[2].toNumber()),
            amount: web3.fromWei(parseInt(result[3].toNumber()))
          };

          switch (parseInt(result[4].toNumber())) {
            case 0:
              bet.type = "Single";
              break;
            case 38:
              bet.type = "Even";
              break;
            case 39:
              bet.type = "Odd";
              break;
          }
          RouletteApp.addLocalBet(bet);
        });
      }
    }, function (error) {
      log(error.message, "error");
    });
  },

  notifyResult: () => {
    $("#bets").remove("tr:not('#no-bets')");
    $("#outcome_section").removeClass("invisible");
    $("#outcome_number").text(RouletteApp.last.result);
  },

  newBet: () => {
    var select = $("#new_bet_type");
    var type = select.find(":selected").attr("value");
    var value = $("#new_bet_value").val();

    RouletteApp.last.bet = type;

    if (type === "even") {
      RouletteApp.contract.instance.betEven({
        from: RouletteApp.account,
        value: web3.toWei(value),
        gas: 2000000
      }).then(function () {
        RouletteApp.watchBalance();
      });
    } else if (type === "odd") {
      RouletteApp.contract.instance.betOdd({
        from: RouletteApp.account,
        value: web3.toWei(value),
        gas: 2000000
      }).then(function () {
        RouletteApp.watchBalance();
      });
    } else {
      RouletteApp.contract.instance.betSingle(parseInt(type), {
        from: RouletteApp.account,
        value: web3.toWei(value),
        gas: 2000000
      }).then(function () {
        RouletteApp.watchBalance();
      });
    }
  }
}

function finishSpin() {
  $("#bets").remove("tr:not('#no-bets')");
  $("#no-bets").removeClass("collapse");

  $("#outcome_section").show();
  $("#spin").show();
  $("#newBet").show();

  RouletteApp.notifyResult();
  RouletteApp.refreshOldBets();
}

$(document).ready(function () {
  web3.eth.defaultAccount = web3.eth.accounts[0];
  RouletteApp.init();

  $(window).on('beforeunload', function () {
    localStorage.setItem("old_bets", JSON.stringify(RouletteApp.oldBets));
  });
});