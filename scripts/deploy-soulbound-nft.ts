import { ethers } from "hardhat"

async function main() {
    const RepUBoundNftFactory = await ethers.getContractFactory('RepUBoundNft');
    const repuBoundNft = await RepUBoundNftFactory.deploy();
    await repuBoundNft.deployed();

    console.log('Contract deployed to: ', repuBoundNft.address);
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})