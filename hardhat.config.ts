// hardhat.config.js
import "dotenv/config"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-solhint"
// import "@nomiclabs/hardhat-solpp"
import "@tenderly/hardhat-tenderly"
import "@nomiclabs/hardhat-waffle"
import "hardhat-abi-exporter"
import "hardhat-deploy"
import "hardhat-deploy-ethers"
import "hardhat-gas-reporter"
import "hardhat-spdx-license-identifier"
import "hardhat-watcher"
import "solidity-coverage"

import '@openzeppelin/hardhat-upgrades';


import { normalizeHardhatNetworkAccountsConfig } from "hardhat/internal/core/providers/util";
import { BN, bufferToHex, privateToAddress, toBuffer } from "ethereumjs-util";
import { removeConsoleLog } from "hardhat-preprocessor";

import { task } from "hardhat/config";


const accounts = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
  accountsBalance: "990000000000000000000",
}

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async function (taskArguments, hre, runSuper) {
//   const networkConfig = hre.config.networks["mainnet"]
//
//   console.log(networkConfig.accounts)
//
//   const accounts1 = normalizeHardhatNetworkAccountsConfig(networkConfig.accounts)
//
//   console.log("Accounts")
//   console.log("========")
//
//   for (const [index, account] of accounts1.entries()) {
//     const address = bufferToHex(privateToAddress(toBuffer(account.privateKey)))
//     const privateKey = bufferToHex(toBuffer(account.privateKey))
//     const balance = new BN(account.balance).div(new BN(10).pow(new BN(18))).toString(10)
//     console.log(`Account #${index}: ${address} (${balance} ETH)
// Private Key: ${privateKey}
// `)
//   }
// })

task("named-accounts", "Prints the list of named account", async ({getNamedAccounts}) => {
  console.log({ namedAccounts: await getNamedAccounts() })
})

task("block", "Prints the current block", async (_, { ethers }) => {
  const block = await ethers.provider.getBlockNumber()

  console.log("Current block: " + block)
})

task("pairs", "Prints the list of pairs", async () => {
  // ...
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  abiExporter: {
    path: "./build/abi",
    //clear: true,
    flat: true,
    // only: [],
    // except: []
  },
  defaultNetwork: "hardhat",
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: ["contracts/mocks/", "contracts/libraries/"],
  },
  hardhat: {
    forking: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      blockNumber: 11979351
    },
  },
  // mocha: {
  //   timeout: 0,
  // },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    alice: {
      default: 1,
      // hardhat: 0,
    },
    bob: {
      default: 2,
      // hardhat: 0,
    },
    carol: {
      default: 3,
      // hardhat: 0,
    },
    fee: {
      // Default to 1
      default: 1,
      // Multi sig feeTo address
      // 1: "",
    },
    dev: {
      // Default to 1
      default: 1,
      // Borings devTo address
      // 1: "",
    },
  },

  networks: {
    hardhat: {
      chainId: 1337,
      accounts,
    },
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [process.env.PRIVATE_KEY],
    //   gasPrice: 120 * 1000000000,
    //   chainId: 1,
    // },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.ROPSTEN_PRIVATE_KEY}`],
      chainId: 3,
      live: true,
      gasPrice: 20000000000,
      saveDeployments: true,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 42,
      live: true,
      saveDeployments: true,
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [`0x${process.env.BSC_TESTNET_PRIVATE_KEY}`],
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.RINKEBY_PRIVATE_KEY}`],
      chainId: 4,
    },
    vegatestnet: {
      url: `http://etestnet.vegaswap.io:8545`,
      accounts: [`0x${process.env.RINKEBY_PRIVATE_KEY}`],
      chainId: 777,
    },
  },
  preprocess: {
    eachLine: removeConsoleLog((bre) => bre.network.name !== "hardhat" && bre.network.name !== "localhost"),
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT,
    username: process.env.TENDERLY_USERNAME,
  },
  watcher: {
    compile: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
  }
}