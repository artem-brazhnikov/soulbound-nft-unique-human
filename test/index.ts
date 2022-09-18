import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import {
    getProof,
    getRoot,
    prepareWorldID,
    registerIdentity,
    registerInvalidIdentity,
    setUpWorldID,
} from './helpers/InteractsWithWorldID'

describe('RepUIdController', function () {
    let repUIdController: Contract
    let callerAddr: string

    this.beforeAll(async () => {
        await prepareWorldID()
    })

    beforeEach(async () => {
        const [signer] = await ethers.getSigners()
        const worldIDAddress = await setUpWorldID()
        const RepUIdControllerFactory = await ethers.getContractFactory('RepUIdController')
        repUIdController = await RepUIdControllerFactory.deploy(worldIDAddress)
        await repUIdController.deployed()

        callerAddr = await signer.getAddress()
    })

    it('Accepts and validates calls', async function () {
        await registerIdentity()

        const [nullifierHash, proof] = await getProof(repUIdController.address, callerAddr)

        const tx = await repUIdController.verifyAndExecute(
            callerAddr,
            await getRoot(),
            nullifierHash,
            proof
        )

        await tx.wait()

        // extra checks here
        const registeredIdentity = await repUIdController.identityOfNullifier(nullifierHash);
        expect(registeredIdentity).to.equal(callerAddr, "This nullifer hash must correspond a different address");
    })

    it('Rejects duplicated calls', async function () {
        await registerIdentity()

        const [nullifierHash, proof] = await getProof(repUIdController.address, callerAddr)

        const tx = await repUIdController.verifyAndExecute(
            callerAddr,
            await getRoot(),
            nullifierHash,
            proof
        )

        await tx.wait()

        await expect(
            repUIdController.verifyAndExecute(callerAddr, await getRoot(), nullifierHash, proof)
        ).to.be.revertedWith('InvalidNullifier')

        // extra checks here
    })
    it('Rejects calls from non-members', async function () {
        await registerInvalidIdentity()

        const [nullifierHash, proof] = await getProof(repUIdController.address, callerAddr)

        await expect(
            repUIdController.verifyAndExecute(callerAddr, await getRoot(), nullifierHash, proof)
        ).to.be.revertedWith('InvalidProof')

        // extra checks here
    })
    it('Rejects calls with an invalid signal', async function () {
        await registerIdentity()

        const [nullifierHash, proof] = await getProof(repUIdController.address, callerAddr)

        await expect(
            repUIdController.verifyAndExecute(repUIdController.address, await getRoot(), nullifierHash, proof)
        ).to.be.revertedWith('InvalidProof')

        // extra checks here
    })
    it('Rejects calls with an invalid proof', async function () {
        await registerIdentity()

        const [nullifierHash, proof] = await getProof(repUIdController.address, callerAddr)
        proof[0] = (BigInt(proof[0]) ^ BigInt(42)).toString()

        await expect(
            repUIdController.verifyAndExecute(callerAddr, await getRoot(), nullifierHash, proof)
        ).to.be.revertedWith('InvalidProof')

        // extra checks here
    })
})
