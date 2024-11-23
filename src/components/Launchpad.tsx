import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Image, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import createMintForSPLToken from "../utils/spl-token-mint";
import { PinataSDK } from "pinata-web3";
import createMintForToken22 from "../utils/token22-mint";

export interface tokenDataInterface{
    name: string,
    symbol: string,
    decimals: number,
    supply: number,
    uri: string,
    description: string,
    revokeUpdate: boolean,
    revokeFreeze: boolean,
    revokeMint: boolean
}

interface tokenFormInterFace extends tokenDataInterface {
    tokenProgram: string,
    image: File | null,
}

function Launchpad() {
    // initializing pinata object using PinataSDK class
    const pinata = new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINAATA_JWT,
        pinataGateway: import.meta.env.VITE_PINAATA_GATEWAY,
    });

    // Getting wallet and connection from solana-wallet-adapter
    const wallet = useWallet();
    const { connection } = useConnection();

    // Initializing state variables
    const [tokenform, setTokenform] = useState<tokenFormInterFace>({
        tokenProgram: 'Token Program',
        name: '',
        symbol: '',
        decimals: 9,
        supply: 1000000000,
        image: null,
        uri: '',
        description: '',
        revokeUpdate: false,
        revokeFreeze: false,
        revokeMint: false
    });

    // Function to apply onchange update for tokenform
    const tokenFormOnchange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setTokenform({ ...tokenform, [e.target.name]: e.target.value });
    }

    // Function to create token
    const createToken = async(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let tokenUri = '';

        // Generate Image URL and set it in tokenform
        if(tokenform.image){
            const ipfsUri = await uploadToIPFS(tokenform.image, tokenform.name, tokenform.symbol, tokenform.description);
            if(!ipfsUri) return console.log("Can not generate image uri");
            setTokenform({ ...tokenform, uri: ipfsUri });
            tokenUri = ipfsUri;
        }

        // console.log("uri: ", tokenform.uri);
        console.log("uri: ", tokenUri);

        // Set the token data
        const tokenData: tokenDataInterface = {
            name: tokenform.name,
            symbol: tokenform.symbol,
            uri: tokenUri,
            decimals: tokenform.decimals,
            supply: tokenform.supply,
            description: tokenform.description,
            revokeFreeze: tokenform.revokeFreeze,
            revokeMint: tokenform.revokeMint,
            revokeUpdate: tokenform.revokeUpdate
        }

        // Check What token program has been choosen by the user
        if(tokenform.tokenProgram === "Token Program"){
            console.log("Token Program Choosen");
            await createMintForSPLToken(wallet, connection, tokenData);
        }else{
            console.log("Token22 Program Choosen");
            await createMintForToken22(wallet, connection, tokenData);
        }

        // Setting the tokenfrom to default state
        setTokenform({
            tokenProgram: 'Token Program',
            name: '',
            symbol: '',
            decimals: 9,
            supply: 1000000000,
            image: null,
            uri: '',
            description: '',
            revokeUpdate: false,
            revokeFreeze: false,
            revokeMint: false
        });
    }

    // Function to upload image and metadata.json to IPFS and generate corresponding link
    const uploadToIPFS = async(image: File, name: string, symbol: string, description: string) => {
        try {
            // Uploading image to IPFS
            const imageUpload = await pinata.upload.file(image);
            const imageURL = `https://gateway.pinata.cloud/ipfs/${imageUpload.IpfsHash}`;
            console.log("IPFS link of the image: ", imageURL);

            // Creating metadata.json
            const metadata = {
                name: name,
                symbol: symbol,
                description: description,
                image: imageURL
            }
            const metadataFile = new File([JSON.stringify(metadata)], "metadata.json", { type: "application/json" });
            const jsonUpload = await pinata.upload.file(metadataFile);
            const jsonURL = `https://gateway.pinata.cloud/ipfs/${jsonUpload.IpfsHash}`
            console.log("IPFS link of the json: ", jsonURL);

            return jsonURL;
        } catch (error) {
            console.log("Can not upload image to IPFS: ", error);
            return null;
        }
    }

  return (
    <section id="launchpad" className="flex justify-center items-center mt-10">
        <div className="flex w-[85%] justify-center items-center flex-col bg-[#150c35] rounded-2xl py-20">
            <h2 className="text-white/95 text-5xl">Solana Token Launcher</h2>
            <p className="text-white/95 my-2">Easily Create your own Solana SPL Token in just 7+1 steps without Coding.</p>

            <form onSubmit={createToken} className="w-full flex justify-center items-center">
                <div className="flex flex-col justify-center items-start mt-14 w-[80%]">
                    <div className="flex justify-between items-center w-full my-2">
                        <div className="flex flex-col justify-between items-start text-white/95 w-full px-4">
                            <label htmlFor="tokenProgram" className="my-2 font-semibold">Choose Token Program:</label>
                            <select id="tokenProgram" className="border-2 border-white w-full bg-transparent py-2 px-3 rounded-md" name="tokenProgram" value={tokenform.tokenProgram} onChange={tokenFormOnchange}>
                                <option className="bg-[#150c35] p-2 text-white/85" value="Token Program">Token Program</option>
                                <option className="bg-[#150c35] p-2 text-white/85" value="Token22 Program">Token22 Program</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-between items-center w-full my-2">
                        <div className="flex flex-col justify-between items-start text-white/95 w-full px-4">
                            <label htmlFor="tokenName" className="my-2 font-semibold">Name:</label>
                            <input type="text" id="tokenName" placeholder="Put the name of your token" className="border-2 border-white w-full bg-transparent py-2 px-3 rounded-md" name="name" value={tokenform.name} onChange={tokenFormOnchange} />
                        </div>
                        <div className="flex flex-col justify-between items-start text-white/95 w-full px-4">
                            <label htmlFor="tokenSymbol" className="my-2 font-semibold">Symbol:</label>
                            <input type="text" id="tokenSymbol" placeholder="Put the symbol of your token" className="border-2 border-white w-full bg-transparent py-2 px-3 rounded-md" name="symbol" value={tokenform.symbol} onChange={tokenFormOnchange} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center w-full my-2">
                        <div className="flex flex-col justify-between items-start text-white/95 w-full px-4">
                            <label htmlFor="tokenDecimals" className="my-2 font-semibold">Decimals:</label>
                            <input type="text" id="tokenDecimals" placeholder="Put the decimals of your token" className="border-2 border-white w-full bg-transparent py-2 px-3 rounded-md" name="decimals" value={tokenform.decimals} onChange={tokenFormOnchange} />
                        </div>
                        <div className="flex flex-col justify-between items-start text-white/95 w-full px-4">
                            <label htmlFor="tokenSupply" className="my-2 font-semibold">Supply:</label>
                            <input type="text" id="tokenSupply" placeholder="Put the supply of your token" className="border-2 border-white w-full bg-transparent py-2 px-3 rounded-md" name="supply" value={tokenform.supply} onChange={tokenFormOnchange} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center w-full my-2 h-[25svh]">
                        <div className="flex flex-col justify-between items-start text-white/95 w-full px-4 h-full">
                            <p className="my-2 font-semibold">Image:</p>
                            <input type="file" accept="image/*" id="tokenImage" name="image" onChange={(e)=>setTokenform({ ...tokenform, image: e.target.files ? e.target.files[0] : null })} hidden/>
                            <label htmlFor="tokenImage" className="border-2 cursor-pointer border-white w-full flex justify-center items-center bg-transparent py-2 px-3 rounded-md h-full">
                                {
                                    !tokenform.image && 
                                    <>
                                        <Upload className="mr-2"/>
                                        <p>Upload Image</p>
                                    </>
                                }
                                {
                                    tokenform.image &&
                                    <>
                                        <Image className="mr-2"/>
                                        <p>{tokenform.image.name}</p>
                                    </>
                                }
                            </label>
                        </div>
                        <div className="flex flex-col justify-between items-start text-white/95 w-full px-4 h-full">
                            <label htmlFor="tokenDescription" className="my-2 font-semibold">Description:</label>
                            <textarea id="tokenDescription" placeholder="Put the description of your token" className="border-2 border-white w-full bg-transparent py-2 px-3 rounded-md h-full" name="description" onChange={tokenFormOnchange} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center w-full my-6">
                        <div className="flex flex-col justify-between items-start text-white/95 w-[30%] px-4">    
                            <label className="flex flex-col justify-center items-start cursor-pointer">
                                <span className="font-semibold text-white/85 mb-2">Revoke Update (Immutable)</span>
                                <p className="mb-4">Freeze Authority allows you to freeze token accounts</p>
                                <input type="checkbox" value="" className="sr-only peer"/>
                                <div className="relative w-12 h-6 bg-[#150c35] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full p-3 border-2 border-gray-400 pee peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex flex-col justify-between items-start text-white/95 w-[30%] px-4">    
                            <label className="flex flex-col justify-center items-start cursor-pointer">
                                <span className="font-semibold text-white/85 mb-2">Revoke Freeze</span>
                                <p className="mb-4">Update Authority allows you to update token metadata</p>
                                <input type="checkbox" value="" className="sr-only peer"/>
                                <div className="relative w-12 h-6 bg-[#150c35] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full p-3 border-2 border-gray-400 pee peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex flex-col justify-between items-start text-white/95 w-[30%] px-4">    
                            <label className="flex flex-col justify-center items-start cursor-pointer">
                                <span className="font-semibold text-white/85 mb-2">Revoke Mint</span>
                                <p className="mb-4">Mint Authority allows you to mint more supply</p>
                                <input type="checkbox" value="" className="sr-only peer"/>
                                <div className="relative w-12 h-6 bg-[#150c35] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full p-3 border-2 border-gray-400 pee peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-center items-center mt-5 w-full">
                        {wallet.connected &&
                            <button className="bg-themeBlue text-white text-lg px-16 py-2 rounded-md">Create Token</button>
                        }
                        {!wallet.connected &&
                            <WalletMultiButton style={{ backgroundColor: '#351A88', padding: '15px 20px' }} className='font-poppins'/>
                        }
                    </div>
                </div>
            </form>
        </div>
    </section>
  )
}

export default Launchpad