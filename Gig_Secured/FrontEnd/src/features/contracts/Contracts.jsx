/** @format */
'use client';
import Auth from '@/app/auth/Auth';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import childAbi from '@/app/auth/abi/child.json';
import factoryAbi from '@/app/auth/abi/factory.json';
import { factoryAddress } from '@/app/auth/contractAddress';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

export default function AllContracts() {
  const { address, isConnected } = useAccount();
  const { providerRead } = Auth();
  const [fetchedContracts, setFetchedContracts] = useState([]);
  const [hasContract, setHasContract] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [tx, setTx] = useState('');

  const getAddressContractsCount = async (registerAddress) => {
    if (registerAddress === '') {
      return;
    }
    const contractRead = new ethers.Contract(
      registerAddress,
      childAbi,
      providerRead
    );
    let tx = await contractRead.getAllGigs();
    const tr = Object.values(tx);
    setFetchedContracts(tr);
  };

  useEffect(() => {
    const contract = new ethers.Contract(
      factoryAddress,
      factoryAbi,
      providerRead
    );
    const getConnectedWalletStatus = async () => {
      setLoadingPage(true);
      let tx = await contract.getCreatorSystem(address);

      if (tx === '0x0000000000000000000000000000000000000000') {
        setHasContract(false);
      } else {
        setHasContract(true);
        getAddressContractsCount(tx);
        setTx(tx);
      }
      setLoadingPage(false);
    };
    if (isConnected) {
      getConnectedWalletStatus();
    }
  }, []);

  return (
    <div>
      {isConnected ? (
        <div>
          {loadingPage && !hasContract && (
            <div role='status' className='flex justify-center mt-10 w-full'>
              <svg
                aria-hidden='true'
                className='inline w-24 h-24 text-gray-200 animate-spin dark:text-gray-300 fill-[#0E4980]'
                viewBox='0 0 100 101'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                  fill='currentColor'
                />
                <path
                  d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                  fill='currentFill'
                />
              </svg>
              <span className='sr-only'>Loading...</span>
            </div>
          )}
          {!loadingPage && !hasContract && tx === '' && (
            <div className='px-3 py-4 text-center font-bold mx-auto rounded-lg mt-10 bg-[#D2E9FF] text-black text-xl block leading-[25.5px] tracking-[0.5%]'>
              No contracts register, Please proceed to Dashboard to create a
              register
            </div>
          )}

          {!loadingPage && hasContract && tx !== '' && (
            <div className='mt-20 '>
              <Link
                href='/contracts/create'
                className='w-full flex funda_bg rounded-2xl cursor-pointer'
              >
                <div className='w-[90%] mx-auto py-3 flex justify-between items-center'>
                  <div className=''>
                    <img
                      src='./Group.svg'
                      alt=''
                      className='w-[56px] h-[56px]'
                    />
                    <h2 className='text-black text-[20px] font-bold head2 leading-[26px] tracking-[1.3%] mt-[20px]'>
                      Create a new Contract
                    </h2>
                  </div>
                  <div className=''>
                    <img
                      src='./Transfer.png'
                      alt=''
                      className='w-[48px] h-[48px]'
                    />
                  </div>
                </div>
              </Link>

              <div className='my-10 flex gap-6 flex-wrap'>
                {fetchedContracts.length === 0 && !loadingPage && (
                  <div className='text-2xl font-bold w-full text-center block'>
                    <span>You don't have any contracts</span>
                  </div>
                )}
              </div>

              <div className='my-10 flex gap-6 flex-wrap'>
                {fetchedContracts.length > 0 &&
                  fetchedContracts.map((item, index) => (
                    <div
                      key={index}
                      className='card w-fit bg-white border shadow-md border-black flex-grow text-black'
                    >
                      <div className='card-body'>
                        <h2 className='card-title'>
                          {item[0]} - <span className='text-sm'>{item[1]}</span>
                        </h2>
                        <div className='flex gap-2'>
                          <span className='font-bold'>
                            Project Documentation:
                          </span>
                          <a href={item[6]} target='_blank' className='underline'>
                            {item[6]}
                          </a>
                        </div>
                        <div className='card-actions justify-end'>
                          <Link href={`/contracts/view?id=${index + 1}`}>
                            <button className='btn bg-[#D2E9FF] hover:bg-[#76bbff] text-black border-[#D2E9FF'>
                              More Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <span className='mx-auto rounded-lg mt-10 bg-[#D2E9FF] text-black text-center block leading-[25.5px] tracking-[0.5%] p-4 fnt-bold text-2xl'>
          Not Connected
        </span>
      )}
    </div>
  );
}
