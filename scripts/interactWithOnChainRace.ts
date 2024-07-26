import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV4, Address } from "@ton/ton";
import { OnChainRace } from "../wrappers/OnChainRace"; // Adjust the import path as necessary
import axios, { AxiosError } from "axios";

export async function run() {
    try {
        console.log("Starting interaction with OnChainRace contract...");

        // Initialize TON RPC client on testnet
        const endpoint = await getHttpEndpoint({ network: "testnet" });
        console.log(`Using endpoint: ${endpoint}`);
        const client = new TonClient({ endpoint });

        // Open wallet v4
        const mnemonic = "clarify friend crime route horse daughter convince chalk feed power desk mystery knock ocean tornado actor skill glow theory off suspect nut obvious yard"; // Replace with your 24 secret words
        const key = await mnemonicToWalletKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

        const isDeployed = await client.isContractDeployed(wallet.address);
        console.log(`Wallet is deployed: ${isDeployed}`);
        if (!isDeployed) {
            return console.log("Wallet is not deployed");
        }
        console.log(`Wallet address: ${wallet.address.toString()}`);

        // Open wallet and read the current seqno of the wallet
        const walletContract = client.open(wallet);
        const walletSender = walletContract.sender(key.secretKey);
        const seqno = await walletContract.getSeqno();
        console.log("Seqno: ", seqno);

        // Open OnChainRace instance by address
        const onChainRaceAddress = Address.parse("kQDW1VLFvS3FJW5rl2tyNfQ-mOfN5nPYGPAHh1vueJsRywwm"); // Replace with your contract address
        const onChainRace = OnChainRace.createFromAddress(onChainRaceAddress);
        console.log(`OnChainRace contract address: ${onChainRaceAddress.toString()}`);

        // Create a ContractProvider for OnChainRace contract
        const onChainRaceProvider = client.provider(onChainRaceAddress);

        // Send the set data transaction
        const time = Math.floor(Date.now() / 1000); // Current UNIX timestamp
        const userAddress = Address.parse("EQCi6oj8WcXWmn90sK8_ynM5OrlQUBtkMYvq-JBClxYwBYEc"); // Replace with the desired address
        console.log(`Sending transaction with time: ${time}, userAddress: ${userAddress.toString()}`);

        // Send the message to the contract
        await onChainRace.sendSetData(onChainRaceProvider, walletSender, BigInt(0.1 * 1e9), time, userAddress);

        // Wait until confirmed
        let currentSeqno = seqno;
        while (currentSeqno === seqno) {
            console.log("Waiting for transaction to confirm...");
            await sleep(1500);
            currentSeqno = await walletContract.getSeqno();
        }
        console.log("Transaction confirmed!");

        // Retrieve and log run time
        const runTime = await onChainRace.getRunTime(onChainRaceProvider);
        console.log("Run Time:", runTime);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle AxiosError
            console.error('Axios error:', error.message);
            console.error('Response data:', error.response?.data);
        } else {
            // Handle other errors
            console.error('Unexpected error:', error);
        }
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

run().catch(console.error);
