import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { OnChainRace } from '../wrappers/OnChainRace';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('OnChainRace', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('OnChainRace');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let onChainRace: SandboxContract<OnChainRace>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        onChainRace = blockchain.openContract(OnChainRace.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await onChainRace.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: onChainRace.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and onChainRace are ready to use
    });
});
