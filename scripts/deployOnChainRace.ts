import { toNano } from '@ton/core';
import { OnChainRace } from '../wrappers/OnChainRace';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const onChainRace = provider.open(OnChainRace.createFromConfig({}, await compile('OnChainRace')));

    await onChainRace.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(onChainRace.address);

    // run methods on `onChainRace`
}
