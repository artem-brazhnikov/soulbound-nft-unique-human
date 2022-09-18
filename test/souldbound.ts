import { expect } from 'chai'
import { ethers } from 'hardhat';
import { RepUBoundNft } from '../typechain'

describe('RepUBoundNft', () => {
    let repUBoundNft: RepUBoundNft;
    let callerAddr: string;
    let receiverAddr: string;

    beforeEach(async () => {
        const [signer1, signer2] = await ethers.getSigners();
        const RepUBoundNftFactory = await ethers.getContractFactory('RepUBoundNft');
        repUBoundNft = await RepUBoundNftFactory.deploy();
        await repUBoundNft.deployed();

        callerAddr = await signer1.getAddress();
        receiverAddr = await signer2.getAddress();
    })

    it('Creates Soulbound NFT', async () => {
        const tx = await repUBoundNft.issueRepUBound(callerAddr, 'https://ipfs.co');
        await tx.wait();

        const senderBalance = await repUBoundNft.balanceOf(callerAddr);
        expect(senderBalance).to.equal(1, "Caller must own 1 soulbound nft");

        const ownerOfNft = await repUBoundNft.ownerOf(0);
        expect(ownerOfNft).to.equal(callerAddr, 'Caller doesnt own the expected Soulbound token');
    })

    it('Rejects second Soulbound NFT', async () => {
        const tx = await repUBoundNft.issueRepUBound(callerAddr, 'https://ipfs.co');
        await tx.wait();

        const senderBalance = await repUBoundNft.balanceOf(callerAddr);

        expect(senderBalance).to.equal(1, "Caller must own 1 soulbound nft");

        await expect(
            repUBoundNft.issueRepUBound(callerAddr, 'https://ipfs.co')
        ).to.be.revertedWith('RepUBoundNft: The address already has a RepUBoundNft')
    })

    it('Rejects transfer of Soulbound NFT', async () => {
        const tx = await repUBoundNft.issueRepUBound(callerAddr, 'https://ipfs.co');
        await tx.wait();

        const senderBalance = await repUBoundNft.balanceOf(callerAddr);

        expect(senderBalance).to.equal(1, "Caller must own 1 soulbound nft");

        await expect(
            repUBoundNft.transferFrom(callerAddr, receiverAddr, 0)
        ).to.be.revertedWith('RepUBoundNonTransferrable')
    })
})