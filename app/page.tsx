'use client'

import React from 'react';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useTonAddress } from '@tonconnect/ui-react';
import { useTonWallet } from '@tonconnect/ui-react';

function Page() {
  const address = useTonAddress(); 
  const wallet = useTonWallet();


  const walletDevice = wallet? wallet.device.appName : 'Connect wallet to display wallet';
  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connect your TON wallet';

  return (
    <div className="flex justify-center flex-col items-center h-screen">
      <div className='flex flex-col justify-center items-center'>
        <h1 className='text-3xl mb-6'>My App</h1>
        <TonConnectButton />
     </div>

      <div className="mt-4">
        <p>Address: <span className='font-bold text-blue-500'>{shortAddress}</span></p>
        <p>Wallet: {walletDevice}</p>
      </div>
    </div>
  );
}

export default Page;
