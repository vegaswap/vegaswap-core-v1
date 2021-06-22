import { latest, duration, getContext, ZERO_ADDRESS, toSolNumber, increaseBlockTime } from "../utils";
import { ethers, upgrades, network } from "hardhat";
const cron = require('node-cron');

async function main() {
  console.log(`${new Date().toString()} Deploying ...`)
  const { accounts } = await getContext();
  const [owner] = accounts;

  const Broker = await ethers.getContractFactory("Broker");

  const broker = await Broker.deploy();
  await broker.deployed();
  const deployedContracts = [];
  deployedContracts.push({
    name: "Broker",
    address: broker.address
  });

  console.log("Deployed successfully\n");
  console.table(deployedContracts);
  
   
}

main()
    // .then(() => process.exit(0))
    // .catch(error => {
    //   console.error(error);
    //   process.exit(1);
    // });