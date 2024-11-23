import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { tokenDataInterface } from "../components/Launchpad";
import { createInitializeMetadataPointerInstruction, createInitializeMintInstruction, ExtensionType, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { createInitializeInstruction, pack, TokenMetadata } from "@solana/spl-token-metadata";
import { mintGivenToken22 } from "./mint-token";

export default async function createMintForToken22(
    wallet: WalletContextState,
    connection: Connection,
    tokenData: tokenDataInterface
) {
    if (!wallet.publicKey) return console.log("Connect the wallet first");

    // Creating keypairs for mint account
    const mintKeypair = Keypair.generate();

    console.log("token metadata ur recieved: ", tokenData.uri);

    const metadata: TokenMetadata = {
        mint: mintKeypair.publicKey,
        name: tokenData.name,
        symbol: tokenData.symbol,
        uri: tokenData.uri,
        additionalMetadata: [
            ["description", tokenData.description]
        ],
    };

    // Calculating the mint and metadata length
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    // Calculating the Minimum Rent Exemption
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);


    // Creating Instructions
    const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports: lamports,
        programId: TOKEN_2022_PROGRAM_ID
    });
    const initializeMetadatapointerIx = createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID);
    const initializeMintIx = createInitializeMintInstruction(mintKeypair.publicKey, tokenData.decimals, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID);
    const initializeIx = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
    });

    // Creating a new transaction
    const transaction = new Transaction();

    // Adding instructions to the transaction
    transaction.add(createMintAccountIx, initializeMetadatapointerIx, initializeMintIx, initializeIx);

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    const signature = await wallet.sendTransaction(transaction, connection);

    console.log("Mint Address: ", mintKeypair.publicKey.toBase58());
    console.log("token cretated!! Explore the signature: ", signature);

    await mintGivenToken22(wallet, mintKeypair, connection, tokenData.supply);
}