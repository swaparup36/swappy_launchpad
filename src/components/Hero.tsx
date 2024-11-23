import { useNavigate } from "react-router-dom"

function Hero() {
    const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center w-ful mt-10 py-10 h-[80svh]">
        <div className="flex w-[80%] justify-between items-center">
            <div className="flex flex-col">
                <h1 className="text-white/70 text-6xl font-bold max-w-[70%] leading-snug">
                    Explore the Largest <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">NFT</span> Marketplace
                </h1>
                <p className="text-white/50 font-semibold my-4 text-lg">Buy, Sell & Trade Cryptocurrency Easily and Securely</p>
                <div className="flex">
                    <button className="text-white bg-transparent border-4 border-purple-900 px-4 py-1 w-fit my-2 mr-2" onClick={()=>navigate('#launchpad')}>Create Token</button>
                    <button className="text-white bg-themeBlue border-4 border-themeBlue px-4 py-1 w-fit my-2 ml-2" onClick={()=>navigate('#about')}>Learn More</button>
                </div>
            </div>
            <div>
                <img src="./images/hero-image.png" alt="" />
            </div>
        </div>
    </div>
  )
}

export default Hero