import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { tokenDataInterface } from "../components/Launchpad";
import { mintGivenSplToken } from "./mint-token";

export default async function createMintForSPLToken(
  wallet: WalletContextState,
  connection: Connection,
  tokenData: tokenDataInterface
) {
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    if (!wallet.publicKey) return console.log("Connect the wallet first");

    // Creating keypairs for mint account
    const mintKeypair = Keypair.generate();

    // Calculating the Minimum Rent Exemption
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Creating Mint
    const transaction = new Transaction();

    const createMintIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
    });

    const createMintInitializeIx = createInitializeMint2Instruction(mintKeypair.publicKey, tokenData.decimals, wallet.publicKey, wallet.publicKey, TOKEN_PROGRAM_ID)


    // Creating Metadata for the token
    const metadataData = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        uri: tokenData.uri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
    };

    const metadataPDAAndBump = PublicKey.findProgramAddressSync(
        [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    const metadataPDA = metadataPDAAndBump[0];

    const createMetadataAccountInstruction =
        createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataPDA,
            mint: mintKeypair.publicKey,
            mintAuthority: wallet.publicKey,
            payer: wallet.publicKey,
            updateAuthority: wallet.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
            collectionDetails: null,
            data: metadataData,
            isMutable: true,
            },
        }
    );

    // Adding All instructions to the transaction
    transaction.add(createMintIx, createMintInitializeIx, createMetadataAccountInstruction);

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    const signature = await wallet.sendTransaction(transaction, connection);

    console.log("Mint Address: ", mintKeypair.publicKey.toBase58());
    console.log("Metadata PDA: ", metadataPDA.toBase58());
    console.log("token cretated!! Explore the signature: ", signature);

    await mintGivenSplToken(wallet, mintKeypair, connection, tokenData.supply);
}