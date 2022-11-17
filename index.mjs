//  external modules
import inquirer from "inquirer";
import chalk from "chalk";

// internal modules
import fs from "fs";

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Transferir",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer.action;

      switch (action) {
        case "Criar Conta":
          createAccount();
          break;
        case "Consultar Saldo":
          getAccountBallance();
          break;
        case "Depositar":
          deposit();
          break;
        case "Transferir":
          transfer();
          break;
        case "Sacar":
          withDraw();
          break;
        case "Sair":
          console.log(
            chalk.bgBlueBright.black(
              "Obrigado por usar o Accounts! \nVolte sempre!"
            )
          );
          process.exit();
          break;
        default:
          break;
      }
    })
    .catch((err) => console.log(err));
}

// account create
function createAccount() {
  console.log(chalk.bgGreen.black("Obrigado por escolher o nosso banco!"));

  buildAccount();
}

function buildAccount() {
  console.log(chalk.bgGreen.black("Defina as opções a seguir:"));
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Informe o nome da conta a ser criada",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;
      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRedBright.black(
            `A conta informada já existe. 
            Por favor informe outro nome para abertura de sua conta!`
          )
        );
        buildAccount();
      } else {
        fs.writeFileSync(
          `accounts/${accountName}.json`,
          '{"balance": 0}',
          (err) => {
            console.log(err);
          }
        );

        console.log(
          chalk.bgGreenBright.black(
            `Seja bem vindo Sr(a) ${accountName}! Sua conta foi criada com sucesso`
          )
        );

        operation();
      }
    })
    .catch((err) => console.log(err));
}

// check account existence
function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRedBright.black(
        `Conta ${accountName} é inexistente. Por favor informe outro nome de conta!`
      )
    );
    return false;
  } else {
    return true;
  }
}

//  transfering
function transfer() {
  inquirer
    .prompt([
      {
        name: "toWithdrawAccount",
        message: "A partir de qual conta pretende realizar a transferência",
      },
    ])
    .then((answer) => {
      const toWithdrawAccount = answer.toWithdrawAccount;

      if (!checkAccount(toWithdrawAccount)) {
        return transfer();
      }

      const toWithdrawAccountData = getAccount(toWithdrawAccount);

      inquirer
        .prompt([
          {
            name: "amountTransfer",
            message: ("Qual a quantia a ser realizada na transferência?"),
          },
        ])
        .then((answer) => {
          const amountTransfer = answer.amountTransfer;

          if (!amountTransfer || isNaN(amountTransfer)) {
            console.log(
              chalk.bgRedBright.black(
                "Ocorreu algum erro. Tente novamente mais tarde"
              )
            );
            return transfer();
          }

          if (toWithdrawAccountData.balance < amountTransfer) {
            console.log(
              chalk.bgRedBright.black(
                "Valor indisponível para Transferência. Por favor consulte seu saldo!"
              )
            );
            return operation();
          }

          inquirer
            .prompt([
              {
                name: "toEarnAccount",
                message: "Qual conta destino a receber transferência",
              },
            ])
            .then((answer) => {
              const toEarnAccount = answer.toEarnAccount;

              if (!checkAccount(toEarnAccount)) {
                return transfer();
              }

              const toEarnAccountData = getAccount(toEarnAccount);

              transferConclude(toWithdrawAccount, amountTransfer, toEarnAccount)
              operation();
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

// show account balance
function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
}

function getAccountBallance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Informe o nome da conta a ser consultada:",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;

      if (!checkAccount(accountName)) {
        return getAccountBallance();
      } else {
        const accountData = getAccount(accountName);
        console.log(
          chalk.bgGreenBright.black(
            `O saldo atual da conta ${accountName} é de R$ ${accountData.balance}`
          )
        );
        operation();
      }
    })
    .catch((err) => console.log(err));
}

// add an amount to user account
function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount || isNaN(amount)) {
    console.log(
      chalk.bgRedBright.black(
        "Ocorreu algum erro. Por favor tente novamente mais tarde"
      )
    );
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData)),
    (err) => {
      console.log(err);
    };

  console.log(
    chalk.bgGreenBright.black(
      `Foi depositado o valor de R$ ${amount} em ${accountName}`
    )
  );
}

function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Informe o nome da conta a realizar o depósito:",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Informe o valor a ser depositado em sua conta:",
          },
        ])
        .then((answer) => {
          const amount = answer.amount;

          // add amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

// withDraw an amount from user
function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount  || isNaN(amount)) {
    console.log(
      chalk.bgRedBright.black(
        "Ocorreu algum erro. Por favor tente novamente mais tarde!"
      )
    );
    return withDraw;
  }

  if (accountData.balance < amount) {
    console.log(
      chalk.bgRedBright.black(
        "Valor indisponível para saque. Por favor consulte seu saldo!"
      )
    );
    return operation();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );

  console.log(
    chalk.bgGreen(
      `Foi realizado o saque no valor de R$ ${amount} de sua conta.`
    )
  );
  operation();
}

function withDraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da conta a ser realizado o saque?",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;
      if (!checkAccount(accountName)) {
        return withDraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual o valor do saque a ser realizado?",
          },
        ])
        .then((answer) => {
          const amount = answer.amount;
          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function transferConclude (toWithdrawAccount, amountTransfer, toEarnAccount) {

    const accountWithdrawData = getAccount(toWithdrawAccount);
  
    accountWithdrawData.balance = parseFloat(accountWithdrawData.balance) - parseFloat(amountTransfer);
  
    fs.writeFileSync(
      `accounts/${toWithdrawAccount}.json`,
      JSON.stringify(accountWithdrawData),
      (err) => {
        console.log(err);
      }
    );

    const accountEarnData = getAccount(toEarnAccount);
  
    accountEarnData.balance = parseFloat(amountTransfer) + parseFloat(accountEarnData.balance);
  
    fs.writeFileSync(`accounts/${toEarnAccount}.json`, JSON.stringify(accountEarnData)),
      (err) => {
        console.log(err);
      };

      console.log(chalk.bgGreenBright.black(`Sua transferência de R$ ${amountTransfer} da conta ${toWithdrawAccount} para ${toEarnAccount} foi realizada com sucesso`))
  
}
