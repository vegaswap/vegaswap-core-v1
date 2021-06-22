import { latest, duration, getContext, ZERO_ADDRESS, toSolNumber, increaseBlockTime } from "../utils";
import { ethers, upgrades, network } from "hardhat";
const cron = require('node-cron');

async function main() {
  console.log(`${new Date().toString()} interact with contract ...`)
  const { accounts } = await getContext();
  const [owner] = accounts;

  const Broker = await ethers.getContractFactory("Broker");

  const broker_contract = await Broker.attach(
    "0x484E13AE0a15935382834a0433551b04a655662A" // The deployed contract address
  );

  let ca = await broker_contract.creditAddress();
  console.log(ca);

  let p = await broker_contract.getPrice("0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 100);
  //console.log(p.toSolNumber);
  console.log(p.toString());

  let totalcredits = await broker_contract.totalCredits();
  //console.log(p.toSolNumber);
  console.log(totalcredits.toString());
   
}

main()
    // .then(() => process.exit(0))
    // .catch(error => {
    //   console.error(error);
    //   process.exit(1);
    // });