import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, Transaction } from "@solana/web3.js";

export async function mintGivenToken22(
    wallet: WalletContextState,
    mintKeypair: Keypair,
    connection: Connection,
    amount: number
) {
    if (!wallet.publicKey || !connection) return console.log("Connect the wallet first");

    // Creating Associated token account for the given token
    const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
    );

    console.log("Associated token account: ", associatedToken.toBase58());

    const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedToken,
            wallet.publicKey,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID
        )
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
    ).blockhash;

    const signature = await wallet.sendTransaction(transaction, connection);
    console.log("associated token account created, explore the signature: ", signature);

    // Minting given token
    const transaction1 = new Transaction().add(
        createMintToInstruction(
            mintKeypair.publicKey,
            associatedToken,
            wallet.publicKey,
            amount,
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    transaction1.feePayer = wallet.publicKey;
    transaction1.recentBlockhash = (
        await connection.getLatestBlockhash()
    ).blockhash;

    const signature1 = await wallet.sendTransaction(transaction1, connection);

    console.log("token sent, explore the signature: ", signature1);
}

export async function mintGivenSplToken(
    wallet: WalletContextState,
    mintKeypair: Keypair,
    connection: Connection,
    amount: number
){

    if (!wallet.publicKey || !connection) return console.log("Connect the wallet first");

    // Creating Associated token account for the given token
    const associatedTokenAccount  = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
    );

    console.log("Associated token account: ", associatedTokenAccount.toBase58());

    const transaction = new Transaction();

    const associatedTokenAccountIx = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        mintKeypair.publicKey   
    );

    const mintToIx = createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        amount
    );

    transaction.add(associatedTokenAccountIx, mintToIx);

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signature = await wallet.sendTransaction(transaction, connection);
    console.log("token sent, explore the signature: ", signature);
}