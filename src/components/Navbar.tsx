import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { HashLink as Link } from 'react-router-hash-link';

function Navbar() {
  return (
    <div className='px-10 flex justify-between items-center h-[10svh]'>
        <div className='flex justify-between items-center w-[10%]'>
            <img src="./images/swappy-logo-white.png" alt="swappy-logo" className='w-full' />
        </div>
        <div className='flex justify-between items-center text-white w-[50%]'>
          <Link to='/' className='font-semibold cursor-pointer'>Home</Link>
          <Link to='#launchpad' className='font-semibold cursor-pointer'>Token Launchpad</Link>
          <Link to='#launchpad' className='font-semibold cursor-pointer'>NFT Launchpad</Link>
          <Link to='#about' className='font-semibold cursor-pointer'>About</Link>
          <Link to='/' className='font-semibold cursor-pointer'>Liquidity Pool</Link>
        </div>
        <div className='text-white font-bold text-4xl font-poppins'>
            <WalletMultiButton style={{ backgroundColor: '#351A88', padding: '15px 20px' }} className='font-poppins'/>
        </div>
    </div>
  )
}

export default Navbar