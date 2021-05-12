import { latest, duration, getContext, ZERO_ADDRESS, toSolNumber, increaseBlockTime } from "../utils";
import { ethers, upgrades, network } from "hardhat";
const cron = require('node-cron');

async function main() {
  console.log(`${new Date().toString()} Deploying ...`)
  const { accounts } = await getContext();
  const [owner] = accounts;

  const ERC20GovToken = await ethers.getContractFactory("VegaToken");
  const VestingController = await ethers.getContractFactory("VestingController");

  const totalSupply = 10 ** 9;
  const erc20GovToken = await ERC20GovToken.deploy();
  await erc20GovToken.deployed();
  const deployedContracts = [];
  deployedContracts.push({
    name: "VegaToken",
    address: erc20GovToken.address
  });

  const vestingController = await upgrades.deployProxy(VestingController, [
    erc20GovToken.address
  ]);
  await vestingController.deployed();

  deployedContracts.push({
    name: "VestingController",
    address: vestingController.address
  });
  console.log("Deployed successfully\n");
  console.table(deployedContracts);

  // TODO: put to scripts, or put to constructor
  await erc20GovToken.transfer(vestingController.address, toSolNumber(totalSupply));

  // registerSchedule
  const DEFAULT_PERIOD = duration.minutes(10);
  const vestingLog = ({address, cliff, period, amount}) => {
    // const _unit = "months"
    // const _period = 1; // month

    const _unit = "minutes"
    const _period = `5 minutes`; // minutes
    console.log(`Register ${address} with cliff: ${cliff}, release gradually in ${_period}, total amount: ${amount} successfully.`);
    return {
      now: (new Date()).toString(),
      address, 
      cliff: cliff.toString(),
      periodCount: period,
      period: _period,
      amount
    }
  }

  // const vesting
  const vestingLogs = [];
  let log;
  const registerScheduleJs = async function (_vestingSchedule) {
    const {address, cliff, period, amount} = _vestingSchedule;
    await vestingController.connect(owner).registerVestingSchedule( 
      address, // mike address
      cliff, // after 1 month
      period, 
      amount
    );
    vestingLogs.push(vestingLog(_vestingSchedule));
  }

  const vestingSchedule = {
    address: '0x989129a75c79EB00c44b3f3f166EE30BA136D6F2', // Mike
    cliff: ((await latest()).add(duration.seconds(10))),
    period: 5,
    amount: toSolNumber((1.25 / 100) * totalSupply)
  }

  const vestingSchedule1 = {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // jimmy
    cliff: ((await latest()).add(duration.seconds(10))),
    period: 5,
    amount: toSolNumber((1.25 / 100) * totalSupply)
  }

  const vestingSchedule2 = {
    address: '0x1c2Cf4798F4281Dde81ef73caa846c8253DA31a4', // ben
    cliff: ((await latest()).add(duration.seconds(10))),
    period: 5,
    amount: toSolNumber((1.25 / 100) * totalSupply)
  }
  await registerScheduleJs(vestingSchedule);
  await registerScheduleJs(vestingSchedule1);
  await registerScheduleJs(vestingSchedule2);

  console.log("vesting tables:\n");
  console.table(vestingLogs);

  await increaseBlockTime(duration.seconds(30).toNumber());
  await vestingController.connect(owner).release();

  const _balanceOfLog = async (addr) => {
    const amount = await erc20GovToken.balanceOf(addr);
    return {
      addr,
      amount: amount.toString()
    }
    console.log(`Amount of address: ${addr}: ${amount}`)
  }

  let vestingBals = [];
  const addresses = [
    '0x989129a75c79EB00c44b3f3f166EE30BA136D6F2',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    '0x1c2Cf4798F4281Dde81ef73caa846c8253DA31a4',
  ];
  addresses.map(async (x) => {
    vestingBals.push(await _balanceOfLog(x))
  })
  console.table(vestingBals);

  // run cron job to release 
  const releasing = cron.schedule('10 */5 * * * *', async () => { // 5 minutes and 10 seconds
    console.log(`${new Date().toString()} Releasing in cron ...`)
    await vestingController.connect(owner).release();

    vestingBals = await Promise.all(addresses.map(async (x) => {
      console.log("x: ", x)
      return await _balanceOfLog(x);
    }))
    console.table(vestingBals);
  })

  await releasing.start();
}

main()
    // .then(() => process.exit(0))
    // .catch(error => {
    //   console.error(error);
    //   process.exit(1);
    // });