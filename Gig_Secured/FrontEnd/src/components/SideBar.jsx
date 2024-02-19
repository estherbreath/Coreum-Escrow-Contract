'use client';
import React, { useState } from 'react';
import { BiHomeAlt } from 'react-icons/bi';
import { MdWorkOutline } from 'react-icons/md';
import { LiaFileContractSolid } from 'react-icons/lia';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Auth from '@/app/auth/Auth';
import { useAppContext } from '@/app/auth/Context';
import { AiOutlineSecurityScan } from 'react-icons/ai';
import { IoIosArrowDropright, IoIosArrowDropleft } from 'react-icons/io';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RxDashboard } from 'react-icons/rx';
import { useAccount } from 'wagmi';

export default function SideBar() {
  const { address, isConnected } = useAccount();

  const pathname = usePathname();
  // const [sidebar, setSideBar] = useState(true)
  const { sidebar, setSideBar } = useAppContext();

  const menu = address === "0x1b6e16403b06a51C42Ba339E356a64fE67348e92" ? [
    {
      name: 'Home',
      icon: BiHomeAlt,
      href: '/home',
    },
    {
      name: 'Contracts',
      icon: LiaFileContractSolid,
      href: '/contracts',
    },
    {
      name: 'Freelances',
      icon: MdWorkOutline,
      href: '/freelances',
    },
    {
      name: 'Audits',
      icon: AiOutlineSecurityScan,
      href: '/audits',
    },
    {
      name: 'Admin',
      icon: RxDashboard,
      href: '/admin',
    },
  ] :
    [
      {
        name: 'Home',
        icon: BiHomeAlt,
        href: '/home',
      },
      {
        name: 'Contracts',
        icon: LiaFileContractSolid,
        href: '/contracts',
      },
      {
        name: 'Freelances',
        icon: MdWorkOutline,
        href: '/freelances',
      },
      {
        name: 'Audits',
        icon: AiOutlineSecurityScan,
        href: '/audits',
      },
    ]
    ;
  return (
    <main>
      <section
        className={`min-h-screen max-h-screen w-[100px] md-w-full bg-[#D2E9FF] ${!sidebar ? 'w-[100px]' : 'w-[380px]'
          }`}
      >
        <section className='w-[90%] mx-auto'>
          <div className='flex items-center'>
            <Link
              href='/home'
              className='w-[221px] pt-[40px] flex items-center gap-1 mx-auto'
            >
              <div className='flex gap-2 items-center justify-center w-full'>
                {/* <img
                  src='/Group 1.svg'
                  alt='logo'
                  className='w-[40.5px] h-[39px]'
                /> */}
                {sidebar && (
                  <h1 className='text-[28px] leading-6 text-[#0F4880] orbitron_font font-semibold '>
                    GigSecured
                  </h1>
                )}
              </div>
            </Link>
            <div
              onClick={() => setSideBar(!sidebar)}
              className='text-3xl mt-10'
            >
              <span className='text-black hover:cursor-pointer'>
                {sidebar ? <IoIosArrowDropleft /> : <IoIosArrowDropright />}
              </span>
            </div>
          </div>

          <div className='mt-[100px] flex flex-col gap-4'>
            {menu.map((items, index) => {
              const isActive = pathname?.startsWith(items?.href);

              return (
                <Link
                  href={items?.href}
                  key={index}
                  className={`${isActive && 'bg-[#FBFDFF] rounded-lg'
                    } flex gap-2 items-center text-[#0F4880] w-[100%] h-[48px] ${sidebar ? 'pl-[90px]' : 'pl-0'
                    }`}
                >
                  <items.icon
                    size={30}
                    className={`${!sidebar && 'text-center block w-full'}`}
                  />
                  {sidebar && (
                    <h3 className='font-bold text-[20px] leading-7 tracking-[1.3%] head2'>
                      {items.name}
                    </h3>
                  )}
                </Link>
              );
            })}
          </div>

          {/* {sidebar && ( */}
          <div className=' flex items-center bg-[#FBFDFF] text-black rounded-2xl h-[80px] gap-2 justify-center relative w-[100%] top-[140px]'>
            {/* <p className='text-[17px] leading-6 font-normal tracking-[0.5%] text-[#0F4880] head1'>
                194XV7C......ROFYOF
              </p>
              <ConnectButton /> */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                    className=''
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type='button'
                            className='bg-white text-black text-base font-bold'
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type='button'
                            className='bg-white text-black text-2xl font-bold'
                          >
                            Wrong network
                          </button>
                        );
                      }

                      return (
                        <div className='grid gap-3'>
                          <button
                            onClick={openChainModal}
                            style={{ alignItems: 'center' }}
                            className='md:flex grid space-y-2 justify-center'
                            type='button'
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 24,
                                  height: 24,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 24, height: 24 }}
                                  />
                                )}
                              </div>
                            )}
                            {sidebar && chain.name}
                          </button>
                          {sidebar && (
                            <button onClick={openAccountModal} type='button'>
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
          {/* )} */}
        </section>
      </section>
    </main>
  );
}
