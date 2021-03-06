import { expect } from "chai";
import { ethers, network, upgrades } from "hardhat";

import { duration, getContext, increaseBlockTime, latest, ZERO_ADDRESS } from "../../utils";

// init with ercToken address
// register a vesting schedule with totalAmount

const writeToCsv = async function(results) {
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: "./release_output.csv", // at project root
    header: [
      { id: "monthsAfter", title: "monthsAfter" },
      { id: "seed", title: "seed" },
      { id: "privateRound", title: "privateRound" },
      { id: "publicRound", title: "publicRound" },
      { id: "traderProgram", title: "traderProgram" },
      { id: "vegaLiq", title: "vegaLiq" },
      { id: "marketing", title: "marketing" },
      { id: "dev", title: "dev" },
      { id: "ecosystem", title: "ecosystem" },
      { id: "lpGrants", title: "lpGrants" },
      { id: "lpRewards", title: "lpRewards" },
      { id: "team", title: "team" },
      { id: "advisors", title: "advisors" },
      { id: "treasury", title: "treasury" },
      { id: "totalVested", title: "totalVested" },
      { id: "pecentageVested", title: "pecentageVested" },
    ],
  });

  await csvWriter.writeRecords(results); // returns a promise
  console.log("Writing to csv done");
};

describe("VestingController", function() {
  before(async function() {
    this.ERC20GovToken = await ethers.getContractFactory("VegaToken");
    this.VestingController = await ethers.getContractFactory("VestingControllerTest");
  });

  beforeEach(async function() {
    const { accounts } = await getContext();
    const [owner, addr1] = accounts;

    const totalSupply = 10 ** 9;
    this.erc20GovToken = await this.ERC20GovToken.deploy();
    await this.erc20GovToken.deployed();

    this.vestingController = await upgrades.deployProxy(this.VestingController, [
      this.erc20GovToken.address,
      // owner.address,
    ]);
    await this.vestingController.deployed();

    // TODO: put to scripts, or put to constructor
    await this.erc20GovToken.transfer(this.vestingController.address, totalSupply);
  });
  describe("initialize()", function() {
    it("initialize() should set the right vestingToken address", async function() {
      let vestingTokenAddr = await this.vestingController.VEGA_TOKEN.call();
      expect(vestingTokenAddr).to.equal(this.erc20GovToken.address);
    });
  });

  describe("registerVestingSchedule", function() {
    it("registerVestingSchedule() should throw error on invalid inputs", async function() {
      const { accounts } = await getContext();
      const [owner, addr1] = accounts;

      const registerTime = await latest(); // only use to validate test
      const cliffTime = registerTime.add(duration.days(1)); // start immediately
      const terminalPeriodInMonth = 2;
      const totalAmount = 1000;

      let err;
      // zero address should throw error
      try {
        await this.vestingController
          .connect(owner)
          .registerVestingSchedule(ZERO_ADDRESS, cliffTime, terminalPeriodInMonth, totalAmount);
      } catch (e) {
        err = e;
      }

      expect(err.toString()).to.equal("Error: VM Exception while processing transaction: revert VESTING: ZERO_ADDRESS");

      // invalid registerTime, cliffTime should throw error
      try {
        await this.vestingController.connect(owner).registerVestingSchedule(
          addr1.address,
          registerTime.sub(duration.days(1)), // cliffTime is before registerTime
          terminalPeriodInMonth,
          totalAmount,
        );
      } catch (e) {
        err = e;
      }

      expect(err.toString()).to.equal(
        "Error: VM Exception while processing transaction: revert VESTING: CLIFF_>_START",
      );
    });

    it("registerVestingSchedule() should register schedule successfully", async function() {
      const { accounts } = await getContext();
      const [owner, addr1] = accounts;

      const registerTime = await latest();
      const cliffTime = registerTime.add(duration.days(1)); // start immediately
      const terminalPeriodInMonth = 2;
      const totalAmount = 1000;
      const registeredAddress = addr1.address;

      // execute and check for emitted events at the same time
      expect(
        await this.vestingController
          .connect(owner)
          .registerVestingSchedule(registeredAddress, cliffTime, terminalPeriodInMonth, totalAmount),
      ).to.emit(this.vestingController, "VestingScheduleRegistered");

      let res = await this.vestingController.vestingSchedules.call({}, registeredAddress);
      // happy case
      expect(res.terminalPeriodInMonth.toNumber()).to.equal(terminalPeriodInMonth);
      expect(res.cliffTime).to.equal(cliffTime);
      expect(res.totalAmount).to.equal(totalAmount);
      expect(res.registeredAddress).to.equal(registeredAddress);

      // error case: duplicated address
      let err;
      try {
        await this.vestingController
          .connect(owner)
          .registerVestingSchedule(registeredAddress, cliffTime, terminalPeriodInMonth, totalAmount);
      } catch (e) {
        err = e;
      }
      expect(err.toString()).to.equal(
        "Error: VM Exception while processing transaction: revert VESTING: ADDRESS_ALREADY_REGISTERED",
      );
    });
  });

  // describe("updateVestingSchedule", async function () {
  //   beforeEach(async function () {
  //     const { accounts } = await getContext();
  //     const [owner, addr1, addr2] = accounts;

  //     // default period of VestingController contract is 30 days
  //     const registerTime = await latest();
  //     const cliffTime = registerTime.add(duration.days(2));
  //     const terminalPeriodInMonth = 2;
  //     const totalAmount = 10;

  //     // execute and check for emitted events at the same time
  //     await this.vestingController.connect(owner).registerVestingSchedule(
  //       addr1.address, // registeredAddress
  //       cliffTime,
  //       terminalPeriodInMonth,
  //       totalAmount
  //     );
  //   })

  //   it("updateVestingSchedule() should throw error on invalid inputs", async function () {
  //     const { accounts } = await getContext();
  //     const [owner, addr1] = accounts;

  //     const registerTime = await latest(); // only use to validate test
  //     const cliffTime = registerTime.add(duration.days(1)); // start immediately
  //     const terminalPeriodInMonth = 2;
  //     const totalAmount = 1000;

  //     let err;
  //     //only owner error
  //     try {
  //       await this.vestingController
  //         .connect(owner)
  //         .registerVestingSchedule(ZERO_ADDRESS, cliffTime, terminalPeriodInMonth, totalAmount);
  //     } catch (e) {
  //       err = e;
  //     }

  //     expect(err.toString()).to.equal("Error: VM Exception while processing transaction: revert VESTING: ZERO_ADDRESS");

  //     // zero address should throw error
  //     try {
  //       await this.vestingController
  //         .connect(owner)
  //         .registerVestingSchedule(ZERO_ADDRESS, cliffTime, terminalPeriodInMonth, totalAmount);
  //     } catch (e) {
  //       err = e;
  //     }

  //     expect(err.toString()).to.equal("Error: VM Exception while processing transaction: revert VESTING: ZERO_ADDRESS");

  //     // invalid registerTime, cliffTime should throw error
  //     try {
  //       await this.vestingController.connect(owner).registerVestingSchedule(
  //         addr1.address,
  //         registerTime.sub(duration.days(1)), // cliffTime is before registerTime
  //         terminalPeriodInMonth,
  //         totalAmount
  //       );
  //     } catch (e) {
  //       err = e;
  //     }

  //     expect(err.toString()).to.equal(
  //       "Error: VM Exception while processing transaction: revert VESTING: CLIFF_>_START"
  //     );
  //   });

  //   it("registerVestingSchedule() should register schedule successfully", async function () {
  //     const { accounts } = await getContext();
  //     const [owner, addr1] = accounts;

  //     const registerTime = await latest();
  //     const cliffTime = registerTime.add(duration.days(1)); // start immediately
  //     const terminalPeriodInMonth = 2;
  //     const totalAmount = 1000;
  //     const registeredAddress = addr1.address;

  //     // execute and check for emitted events at the same time
  //     expect(
  //       await this.vestingController
  //         .connect(owner)
  //         .registerVestingSchedule(registeredAddress, cliffTime, terminalPeriodInMonth, totalAmount)
  //     ).to.emit(this.vestingController, "VestingScheduleRegistered");

  //     let res = await this.vestingController.vestingSchedules.call({}, registeredAddress);
  //     // happy case
  //     expect(res.terminalPeriodInMonth.toNumber()).to.equal(terminalPeriodInMonth);
  //     expect(res.cliffTime).to.equal(cliffTime);
  //     expect(res.totalAmount).to.equal(totalAmount);
  //     expect(res.registeredAddress).to.equal(registeredAddress);

  //     // error case: duplicated address
  //     let err;
  //     try {
  //       await this.vestingController.connect(owner).registerVestingSchedule(
  //         registeredAddress,
  //         // registerTime,
  //         cliffTime,
  //         terminalPeriodInMonth,
  //         totalAmount
  //       );
  //     } catch (e) {
  //       err = e;
  //     }
  //     expect(err.toString()).to.equal(
  //       "Error: VM Exception while processing transaction: revert VESTING: ADDRESS_ALREADY_REGISTERED"
  //     );
  //   });
  // });

  // registerTime | cliffTime | ..................... | endTime
  //           | release at this ......... n period .........
  describe("getVestedAmount()", async function() {
    it("should return totalAmount if endTime is reached", async function() {
      const { accounts } = await getContext();
      const [owner] = accounts;

      const period = 30; // in seconds
      const registerTime = await latest();
      const cliffTime = registerTime.add(duration.seconds(2)); // start immediately
      // will be auto calculated before calling getVestedAmountTest, we use dummy one to test this case
      const endTime = cliffTime;
      const amountPerTerminalPeriod = 3;
      const totalAmount = 10;

      await increaseBlockTime(6);
      //
      // console.log('DEBUG: network', network);

      const res = await this.vestingController.connect(owner).getVestedAmountTest(
        cliffTime,
        endTime,
        duration.seconds(2), // ignore
        amountPerTerminalPeriod, // ignore
        totalAmount, // ignore
      );
      expect(res.toNumber()).to.equal(10);
    });

    it("should return 0 if cliffTime is not reached", async function() {
      const { accounts } = await getContext();
      const [owner] = accounts;

      const period = 30; // in seconds
      const registerTime = await latest();
      const cliffTime = registerTime.add(duration.seconds(5));
      const endTime = cliffTime.add(duration.seconds(period)); // will be auto calculated before calling getVestedAmountTest

      const res = await this.vestingController.connect(owner).getVestedAmountTest(
        cliffTime,
        endTime,
        duration.seconds(2), // ignore
        2, // ignore
        10, // ignore
      );

      expect(res.toNumber()).to.equal(0);
    });

    it("should return correct amount with cliff time", async function() {
      const { accounts } = await getContext();
      const [owner] = accounts;

      const period = duration.days(2); // in seconds
      const cliffTime = (await latest()).add(duration.days(2));
      const amountPerTerminalPeriod = 3;
      const totalAmount = 10;
      // will be auto calculated before calling getVestedAmountTest
      const endTime = cliffTime.add(period * Math.ceil(totalAmount / amountPerTerminalPeriod));

      await increaseBlockTime(duration.days(2).add(duration.seconds(5)).toNumber()); // pass cliff time
      // console.log('DEBUG: duration.seconds(2)', duration.seconds(2).toNumber());

      let res = await this.vestingController.connect(owner).getVestedAmountTest(
        cliffTime,
        endTime,
        period,
        amountPerTerminalPeriod, // ignore
        totalAmount, // ignore
      );
      expect(res.toNumber()).to.equal(3);

      await increaseBlockTime(duration.days(1).toNumber()); // time since cliff: 1 days
      res = await this.vestingController.connect(owner).getVestedAmountTest(
        cliffTime,
        endTime,
        period, // different period
        amountPerTerminalPeriod, // ignore
        totalAmount, // ignore
      );
      expect(res.toNumber()).to.equal(3);

      await increaseBlockTime(duration.days(1).toNumber()); // time since cliff: 2 days
      res = await this.vestingController.connect(owner).getVestedAmountTest(
        cliffTime,
        endTime,
        period,
        amountPerTerminalPeriod, // ignore
        totalAmount, // ignore
      );
      expect(res.toNumber()).to.equal(6);

      await increaseBlockTime(duration.days(2).toNumber()); // time since cliff: 4 days
      res = await this.vestingController.connect(owner).getVestedAmountTest(
        cliffTime,
        endTime,
        period,
        amountPerTerminalPeriod, // ignore
        totalAmount, // ignore
      );
      expect(res.toNumber()).to.equal(9);

      await increaseBlockTime(duration.days(3).toNumber()); // time since cliff: 7 days
      res = await this.vestingController.connect(owner).getVestedAmountTest(
        cliffTime,
        endTime,
        period,
        amountPerTerminalPeriod, // ignore
        totalAmount, // ignore
      );
      expect(res.toNumber()).to.equal(10);
    });
  });

  describe("getEndTime", async function() {
    it("should returns correct endTime", async function() {
      const registerTime = await latest();
      const cliffTime = registerTime.add(duration.seconds(2));
      const amountPerTerminalPeriod = 3;
      const totalAmount = 10;

      const res = await this.vestingController.getEndTimeTest(cliffTime, amountPerTerminalPeriod, totalAmount);
      expect(res.toNumber()).to.equal(
        cliffTime.add(duration.days(30) * Math.ceil(totalAmount / amountPerTerminalPeriod)).toNumber(),
      );
    });
  });

  describe("_releaseTest()", async function() {
    beforeEach(async function() {});

    // it("should throw error if cliffTime is not passed", async function () {
    //   const { accounts } = await getContext();
    //   const [owner, addr1, addr2] = accounts;
    //
    //   // default period of VestingController contract is 30 days
    //   const registerTime = await latest();
    //   const cliffTime = registerTime.add(duration.days(2));
    //   const terminalPeriodInMonth = 2;
    //   const totalAmount = 10;
    //
    //   // execute and check for emitted events at the same time
    //   await this.vestingController.connect(owner).registerVestingSchedule(
    //     addr1.address, // registeredAddress
    //     // registerTime,
    //     cliffTime,
    //     terminalPeriodInMonth,
    //     totalAmount
    //   );
    //
    //   let adrr1VestingSchedule = await this.vestingController.vestingSchedules.call(
    //     {},
    //     addr1.address
    //   );
    //
    //   // time stays still so CLIFF is not passed
    //   let err;
    //   try {
    //     await this.vestingController
    //       .connect(owner)
    //       ._releaseTest(adrr1VestingSchedule);
    //   } catch (e) {
    //     err = e;
    //   }
    //
    //   expect(err.toString()).to.equal(
    //     "Error: VM Exception while processing transaction: revert VESTING: PAST_CLIFF_TIME"
    //   );
    // });

    it("should release token for share holder", async function() {
      const { accounts } = await getContext();
      const [owner, addr1, addr2] = accounts;

      // default period of VestingController contract is 30 days
      const terminalPeriodInMonth = 2;
      const totalAmount = 10;

      // calculated value to support test
      const amountPerTerminalPeriod = totalAmount / 2;

      // execute and check for emitted events at the same time
      await this.vestingController.connect(owner).registerVestingSchedule(
        addr1.address, // registeredAddress
        (await latest()).add(duration.days(2)),
        terminalPeriodInMonth,
        totalAmount,
      );

      let vestingSchedule = await this.vestingController.vestingSchedules.call({}, addr1.address);

      // increase the time to pass cliffTime
      await increaseBlockTime(duration.days(3).toNumber());

      await this.vestingController.connect(owner)._releaseTest(vestingSchedule);

      let addr1Balance = await this.erc20GovToken.balanceOf(addr1.address);
      expect(addr1Balance.toNumber()).to.equal(5);
    });

    it("should release token for share holder 2", async function() {
      const { accounts } = await getContext();
      const [owner, addr1, addr2] = accounts;

      // default period of VestingController contract is 30 days
      const registerTime = await latest();
      const cliffTime = registerTime.add(duration.days(2));
      const terminalPeriodInMonth = 2;
      const totalAmount = 10;

      // calculated value to support test
      const amountPerTerminalPeriod = totalAmount / 2;

      // execute and check for emitted events at the same time
      await this.vestingController.connect(owner).registerVestingSchedule(
        addr1.address, // registeredAddress
        cliffTime,
        terminalPeriodInMonth,
        totalAmount,
      );

      let vestingSchedule = await this.vestingController.vestingSchedules.call({}, addr1.address);

      // cliffTime is passed but not enough to get the total
      await increaseBlockTime(duration.days(3).toNumber());

      await this.vestingController.connect(owner)._releaseTest(vestingSchedule);
      let addr1Balance = await this.erc20GovToken.balanceOf(addr1.address);
      expect(addr1Balance.toNumber()).to.equal(5);
    });

    it("should release token for share holder 3", async function() {
      const { accounts } = await getContext();
      const [owner, addr1, addr2] = accounts;

      // default period of VestingController contract is 30 days
      const registerTime = await latest();
      const cliffTime = registerTime.add(duration.days(2));
      const terminalPeriodInMonth = 2;
      const totalAmount = 10;

      // calculated value to support test
      const amountPerTerminalPeriod = totalAmount / 2;

      // execute and check for emitted events at the same time
      await this.vestingController.connect(owner).registerVestingSchedule(
        addr1.address, // registeredAddress
        cliffTime,
        terminalPeriodInMonth,
        totalAmount,
      );

      let vestingSchedule = await this.vestingController.vestingSchedules.call({}, addr1.address);

      // cliffTime is passed but not enough to get the total
      await increaseBlockTime(duration.days(2 + 30).toNumber());

      await this.vestingController.connect(owner)._releaseTest(vestingSchedule);
      let addr1Balance = await this.erc20GovToken.balanceOf(addr1.address);
      expect(addr1Balance.toNumber()).to.equal(10);
    });

    // it("should emit Withdrawal event", function () {});
    //
    // it("should emit Withdrawal event", function () {});
  });
  // TODO: test release function owner only

  // TODO integration test
  // This is defined in initialize
  describe("VEGA release schedule", async function() {
    beforeEach(async function() {
      const { accounts } = await getContext();
      const [
        owner,
        seed,
        privateRound,
        publicRound,
        traderProgram,
        vegaLiq,
        marketing,
        dev,
        ecosystem,
        lpGrants,
        lpRewards,
        team,
        advisors,
        treasury,
      ] = accounts;

      this.totalSupply = 10 ** 9;

      this.DEFAULT_PERIOD = duration.days(30);

      // execute and check for emitted events at the same time
      await this.vestingController.connect(owner).registerVestingSchedule(
        seed.address,
        (await latest()).add(this.DEFAULT_PERIOD), // after 1 month
        10,
        (1.25 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        privateRound.address,
        (await latest()).add(duration.seconds(10)), // at listing
        6,
        (4.5 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        publicRound.address,
        (await latest()).add(duration.seconds(10)), // at listing
        0,
        (1.67 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        traderProgram.address,
        (await latest()).add(duration.seconds(10)), // at listing
        4,
        (1.5 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        vegaLiq.address,
        (await latest()).add(duration.seconds(10)), // at listing
        0,
        (15 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        marketing.address,
        (await latest()).add(3 * this.DEFAULT_PERIOD), // 3 months
        20,
        (8 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        dev.address,
        (await latest()).add(3 * this.DEFAULT_PERIOD), // 3 months
        20,
        (8 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        ecosystem.address,
        (await latest()).add(3 * this.DEFAULT_PERIOD), // 3 months
        20,
        (10 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        lpGrants.address,
        (await latest()).add(1 * this.DEFAULT_PERIOD), // 1 month
        4,
        (8 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        lpRewards.address,
        (await latest()).add(1 * this.DEFAULT_PERIOD), // 1 month
        4,
        (20 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        team.address,
        (await latest()).add(12 * this.DEFAULT_PERIOD), // 12 months
        12,
        (15 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        advisors.address,
        (await latest()).add(1 * this.DEFAULT_PERIOD), // 1 month
        24,
        (5 / 100) * this.totalSupply,
      );

      await this.vestingController.connect(owner).registerVestingSchedule(
        treasury.address,
        (await latest()).add(duration.seconds(10)), // at listing
        0,
        (2.08 / 100) * this.totalSupply,
      );
    });

    it("should release successfully after 1 month", async function() {
      const { accounts } = await getContext();
      const [
        owner,
        seed,
        privateRound,
        publicRound,
        traderProgram,
        vegaLiq,
        marketing,
        dev,
        ecosystem,
        lpGrants,
        lpRewards,
        team,
        advisors,
        treasury,
      ] = accounts;

      const afterXMonth = async function(t, x: Number) {
        await increaseBlockTime(t.DEFAULT_PERIOD.toNumber()); // after 1 month
        await t.vestingController.connect(owner).release();
        const seed_ = await t.erc20GovToken.balanceOf(seed.address);
        const priv = await t.erc20GovToken.balanceOf(privateRound.address);
        const publ = await t.erc20GovToken.balanceOf(publicRound.address);
        const traderProgram_ = await t.erc20GovToken.balanceOf(traderProgram.address);
        const vegaLiq_ = await t.erc20GovToken.balanceOf(vegaLiq.address);
        const marketing_ = await t.erc20GovToken.balanceOf(marketing.address);
        const dev_ = await t.erc20GovToken.balanceOf(dev.address);
        const ecosystem_ = await t.erc20GovToken.balanceOf(ecosystem.address);
        const lpGrants_ = await t.erc20GovToken.balanceOf(lpGrants.address);
        const lpRewards_ = await t.erc20GovToken.balanceOf(lpRewards.address);
        const team_ = await t.erc20GovToken.balanceOf(team.address);
        const advisors_ = await t.erc20GovToken.balanceOf(advisors.address);
        const treasury_ = await t.erc20GovToken.balanceOf(treasury.address);

        const totalVested = seed_
          .add(priv)
          .add(publ)
          .add(traderProgram_)
          .add(vegaLiq_)
          .add(marketing_)
          .add(dev_)
          .add(ecosystem_)
          .add(lpGrants_)
          .add(lpRewards_)
          .add(team_)
          .add(advisors_)
          .add(treasury_);
        const pecentageVested = `${(totalVested.toNumber() / 10 ** 9) * 100} %`;

        return {
          monthsAfter: x,
          seed: seed_.toNumber(),
          privateRound: priv.toNumber(),
          publicRound: publ.toNumber(),
          traderProgram: traderProgram_.toNumber(),
          vegaLiq: vegaLiq_.toNumber(),
          marketing: marketing_.toNumber(),
          dev: dev_.toNumber(),
          ecosystem: ecosystem_.toNumber(),
          lpGrants: lpGrants_.toNumber(),
          lpRewards: lpRewards_.toNumber(),
          team: team_.toNumber(),
          advisors: advisors_.toNumber(),
          treasury: treasury_.toNumber(),
          totalVested: totalVested.toNumber(),
          pecentageVested,
        };
      };

      const results = [];
      for (let i = 0; i <= 24; i++) {
        results.push(await afterXMonth(this, i));
      }
      const expectedResults = require("./results1.json");
      expect(results).to.eql(expectedResults);

      await writeToCsv(results);
      console.table(results);
    });
  });
});
