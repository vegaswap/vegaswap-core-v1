import { expect } from "chai";
import { ethers, upgrades, network } from "hardhat";

import { latest, duration, getContext, ZERO_ADDRESS, increaseBlockTime } from "../utils";

// init with ercToken address
// register a vesting schedule with totalAmount

describe("Credits", function () {
  before(async function () {
    this.Credits = await ethers.getContractFactory("Credits");    
    const { accounts } = await getContext();
    const [owner, addr1] = accounts;
    this.owner = owner;
    this.addr1 = addr1;
  });

  beforeEach(async function () {
    
    const totalSupply = 10 ** 9;
    this.credits = await this.Credits.deploy();
    await this.credits.deployed();  
    await this.credits.initialize("VCS");

  });
  describe("total supply", function () {
    it("supply should be 0", async function () {
      let ts = await this.credits.totalSupply.call();
      expect(ts).to.equal(0);
    });
  });

  describe("issue", function () {
    it("supply should be whats issued", async function () {
      console.log(this.owner.address);
      await this.credits.issue(this.owner.address, 100);
      //expect(ts).to.equal(100);
    });
  });

});
