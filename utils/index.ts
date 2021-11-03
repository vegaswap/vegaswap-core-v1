const { ethers, network } = require("hardhat");

const { BigNumber } = ethers;

export async function advanceBlock() {
  return ethers.provider.send("evm_mine", []);
}

export async function advanceBlockTo(blockNumber) {
  for (let i = await ethers.provider.getBlockNumber(); i < blockNumber; i++) {
    await advanceBlock();
  }
}

export async function increase(value) {
  await ethers.provider.send("evm_increaseTime", [value.toNumber()]);
  await advanceBlock();
}

export async function latest() {
  const block = await ethers.provider.getBlock("latest");
  return BigNumber.from(block.timestamp);
}

export async function advanceTimeAndBlock(time) {
  await advanceTime(time);
  await advanceBlock();
}

export async function advanceTime(time) {
  await ethers.provider.send("evm_increaseTime", [time]);
}

export const duration = {
  seconds: function(val) {
    return BigNumber.from(val);
  },
  minutes: function(val) {
    return BigNumber.from(val).mul(this.seconds("60"));
  },
  hours: function(val) {
    return BigNumber.from(val).mul(this.minutes("60"));
  },
  days: function(val) {
    return BigNumber.from(val).mul(this.hours("24"));
  },
  weeks: function(val) {
    return BigNumber.from(val).mul(this.days("7"));
  },
  years: function(val) {
    return BigNumber.from(val).mul(this.days("365"));
  },
};

export const toSolNumber = (x, decimalCount: number = 18): string => {
  let _s = x;
  if (typeof x === "number") {
    _s = x.toString();
  }
  return _s + "0".repeat(decimalCount);
};

/**
 * toJsNumber
 * @param x BigNumber
 * @param decimalCount
 */
export const toJsNumber = (x, decimalCount: number = 18) => {
  let _x = x / 10 ** decimalCount;
  return _x.toFixed(decimalCount);
};

export const toSolidityTime = (time) => {
  return time.getTime() / 1000;
};

export const fromSolidityTime = (time) => {
  return new Date(time * 1000);
};

// Testing utils
export const getContext = async () => {
  const accounts = await ethers.getSigners();
  return {
    accounts,
  };
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const increaseBlockTime = async (x: Number) => {
  await network.provider.send("evm_increaseTime", [x]);
  await network.provider.send("evm_mine");
};
