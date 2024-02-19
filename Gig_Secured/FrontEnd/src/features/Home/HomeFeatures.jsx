"use client"
import React, { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { explore_cards, glasses } from '@/utils'
import Link from 'next/link'
import Image from 'next/image'
import Auth from '@/app/auth/Auth'
import childAbi from '@/app/auth/abi/child.json'
import factoryAbi from '@/app/auth/abi/factory.json'
import { factoryAddress } from '@/app/auth/contractAddress'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'

export default function HomeFeatures() {
  const {
    childAddress,
    providerRead,
    providerWrite,
    setGigSecuredAddress,
    isLoading,
  } = Auth();
  const [contractCounts, setContractsCount] = useState();
  const [hasContract, setHasContract] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [tx, setTx] = useState('');
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [submitLoading, setSubmitLoading] = useState(false);

  const getAddressContractsCount = async (registerAddress) => {
    if (registerAddress === '') {
      return;
    }
    const contractRead = new ethers.Contract(
      registerAddress,
      childAbi,
      providerRead
    );
    let tx = await contractRead.getGigsCount();
    setContractsCount(Number(tx));
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
        setGigSecuredAddress(tx);
      }
      setLoadingPage(false);
    };
    if (isConnected) {
      getConnectedWalletStatus();
    }
  }, [address]);

  const createRegister = async () => {
    const signer = await providerWrite.getSigner();
    const contract = new ethers.Contract(factoryAddress, factoryAbi, signer);
    const contractRead = new ethers.Contract(
      factoryAddress,
      factoryAbi,
      providerRead
    );

    try {
      setSubmitLoading(true);
      let tx = await contract.createGigSecuredContractInstance();
      tx.wait();

      let register = await contractRead.getCreatorSystem(address);
      if (register !== '0x0000000000000000000000000000000000000000') {
        setHasContract(true);
        setTx(register);
      }
      console.log(register);
      setSubmitLoading(false);
      toast.success('Secured Contracts Register created successfully');
    } catch (e) {
      if (e.data && contract) {
        const decodedError = contract.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`);
      } else {
        console.log(`Error in contract:`, e);
      }
      console.log(e);
      setSubmitLoading(false);
    }
  };

  return (
    <Layout>
      {isConnected ? (
        <div className='pt-10 pb-5'>
          <div className='md:flex'>
            <div className='w-full'>
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
                  <span class='sr-only'>Loading...</span>
                </div>
              )}
              {!loadingPage && !hasContract && tx === '' && (
                <>
                  {(!hasContract) &&
                    <button
                      disabled={submitLoading}
                      onClick={() => createRegister()}
                      className='w-[360px] h-[58px] mx-auto rounded-lg mb-10 bg-[#D2E9FF] hover:bg-[#0978e0cb] text-black hover:text-white text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      {submitLoading ? (
                        <div className='flex gap-2 justify-center items-center'>
                          <span className='loading loading-spinner loading-lg'></span>
                          <span>Processing</span>
                        </div>
                      ) : (
                        'Create a Register to add secured contracts'
                      )}
                    </button>
                  }
                  <br />
                  <div className='flex flex-wrap gap-10 text-white'>
                    {explore_cards.map((card, index) => (
                      <div
                        key={index}
                        style={{ backgroundImage: `url(${card.bgCustom})` }}
                        className=' bg-no-repeat bg-cover p-4 rounded-[8px] w-96 h-[200px] flex flex-grow flex-col items-between justify-between '
                      >
                        <Link
                          href={card.direct}
                          className='flex justify-end py-1'
                        >
                          <button className='bg-[#CDCFDE] py-1 px-4 rounded-lg text-[#0F4880]'>
                            Explore &#8594;
                          </button>
                        </Link>
                        <div className='text-white px-3'>
                          <span className='text-xl block mb-1.5 font-bold'>
                            {card?.name}
                          </span>
                          <span className='sm:text-2xl grotesk font-bold leading-[25.5px] tracking-[0.085px] pt-4 pb-2 text-2xl'>
                            {index === 0
                              ? contractCounts
                              : index === 2
                                ? ''
                                : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Video_Opportunities */}
                  <div className='block md:flex gap-10 my-8 text-white'>
                    <div className='block md:w-[50%] w-full border rounded-2xl bg-gray-500 pb-2'>
                      <video
                        controls={true}
                        playsInline
                        muted
                        loop
                        id='myVideo'
                        className={`m-auto bg-cover w- object-cover`}
                      >
                        <source src='./spendNest.mp4' type='video/mp4' />
                        <source src='./spendNest.mp4' type='video/ogg' />
                        your browser does not support the video tag.
                      </video>
                      <span className='text-black w-full px-4 py-2 mt-2 block'>
                        Watch our goal getter video
                      </span>
                    </div>
                    <div className='md:w-[50%] w-full'>
                      <span className='text-lg font-bold text-[#000]'>
                        Opportunities For you
                      </span>
                      <div className='text-black mt-6'>
                        <div className='border flex px-4 rounded-md h-[130px] w-full'>
                          <div className='py-4 w-[80%] flex flex-col justify-between'>
                            <span className='w-[70%]'>
                              Become an Auditor and settle disputes
                            </span>
                            <Link
                              href={`/app?source=`}
                              className='w-fit pt-3 block'
                            >
                              <button className='py-1 px-4 rounded-lg text-[white] text-[17px] bg-[#0F4880]'>
                                Start Now
                              </button>
                            </Link>
                          </div>

                          <div className='border-l rounded-full flex justify-center'>
                            <Image
                              src='/flying_money.svg'
                              alt={''}
                              className='object-cover w-fit px-auto pl-4'
                              width={20}
                              height={20}
                            />
                          </div>
                        </div>
                      </div>
                      <div className='text-black mt-3'>
                        <div className='border flex px-4 rounded-md h-[130px] w-full'>
                          <div className='py-4 w-[80%] flex flex-col justify-between'>
                            <span>Explore all the gigs you are working on</span>
                            <Link
                              href={'services//overdraft'}
                              className='w-fit pt-3 block'
                            >
                              <button className='py-1 px-4 rounded-lg text-[white] text-[17px] bg-[#0F4880]'>
                                Start Now
                              </button>
                            </Link>
                          </div>

                          <div className='border-l rounded-full flex justify-center'>
                            <Image
                              src='/flying_money.svg'
                              alt={''}
                              className='object-cover w-fit px-auto pl-4'
                              width={20}
                              height={20}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!loadingPage && hasContract && tx !== '' && (
                <>
                  <div className='flex flex-wrap gap-10 text-white'>
                    {explore_cards.map((card, index) => (
                      <div
                        key={index}
                        style={{ backgroundImage: `url(${card.bgCustom})` }}
                        className=' bg-no-repeat bg-cover p-4 rounded-[8px] w-96 h-[200px] flex flex-grow flex-col items-between justify-between '
                      >
                        <Link
                          href={card.direct}
                          className='flex justify-end py-1'
                        >
                          <button className='bg-[#CDCFDE] py-1 px-4 rounded-lg text-[#0F4880]'>
                            Explore &#8594;
                          </button>
                        </Link>
                        <div className='text-white px-3'>
                          <span className='text-xl block mb-1.5 font-bold'>
                            {card?.name}
                          </span>
                          <span className='sm:text-2xl grotesk font-bold leading-[25.5px] tracking-[0.085px] pt-4 pb-2 text-2xl'>
                            {index === 0
                              ? contractCounts
                              : index === 2
                                ? ''
                                : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Video_Opportunities */}
                  <div className='block md:flex gap-10 my-8 text-white'>
                    {/* <div className='block md:w-[50%] w-full border rounded-2xl bg-gray-500 pb-2'>
                      <video
                        controls={true}
                        playsInline
                        muted
                        loop
                        id='myVideo'
                        className={`m-auto bg-cover w- object-cover`}
                      >
                        <source src='./spendNest.mp4' type='video/mp4' />
                        <source src='./spendNest.mp4' type='video/ogg' />
                        your browser does not support the video tag.
                      </video>
                      <span className='text-black w-full px-4 py-2 mt-2 block'>
                        Watch our goal getter video
                      </span>
                    </div> */}
                    <div className='w-full'>
                      <span className='text-lg text-center block font-bold text-[#000]'>
                        Opportunities For you
                      </span>
                      <div className='text-black mt-6'>
                        <div className='border flex justify-between px-4 rounded-md h-[130px] w-full'>
                          <div className='py-4 flex flex-col justify-between'>
                            <span className='w-[70%]'>
                              Become an Auditor and settle disputes
                            </span>
                            <Link
                              href={`/audits`}
                              className='w-fit pt-3 block'
                            >
                              <button className='py-1 px-4 rounded-lg text-[white] text-[17px] bg-[#0F4880]'>
                                Start Now
                              </button>
                            </Link>
                          </div>

                          <div className='border-l rounded-full flex justify-center'>
                            <Image
                              src='/flying_money.svg'
                              alt={''}
                              className='object-cover w-fit px-auto pl-4'
                              width={20}
                              height={20}
                            />
                          </div>
                        </div>
                      </div>
                      <div className='text-black mt-3'>
                        <div className='border flex justify-between px-4 rounded-md h-[130px] w-full'>
                          <div className='py-4 flex flex-col justify-between'>
                            <span>Explore all the gigs you are working on</span>
                            <Link
                              href={'freelance'}
                              className='w-fit pt-3 block'
                            >
                              <button className='py-1 px-4 rounded-lg text-[white] text-[17px] bg-[#0F4880]'>
                                Start Now
                              </button>
                            </Link>
                          </div>

                          <div className='border-l rounded-full flex justify-center'>
                            <Image
                              src='/flying_money.svg'
                              alt={''}
                              className='object-cover w-fit px-auto pl-4'
                              width={20}
                              height={20}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <span className='mx-auto rounded-lg mt-10 bg-[#D2E9FF] text-black text-center block leading-[25.5px] tracking-[0.5%] p-4 fnt-bold text-2xl'>
          Not Connected
        </span>
      )}
    </Layout>
  );
}
