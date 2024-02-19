'use client';
import { AiOutlineClose } from 'react-icons/ai';
import Auth from '@/app/auth/Auth';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { FaFileContract } from 'react-icons/fa';
import { LiaSearchengin } from 'react-icons/lia';
import { BsCashCoin } from 'react-icons/bs';
import { SiBlockchaindotcom } from 'react-icons/si';
import { MdOutlineWorkOutline } from 'react-icons/md';
import { FaHandshakeAngle } from 'react-icons/fa6';
import AOS from 'aos'; // You can also use <link> for styles
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Card = ({ icon, title, description }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start({ scale: 1.1, transition: { duration: 0.5 } });
    } else {
      controls.start({ scale: 1 });
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 1 }}
      animate={controls}
      className='card text-[#0F4880] flex flex-col justify-center items-center gap-2  w-80 h-96 bg-[#0F4880] rounded-lg bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 p-8 shadow-[0px_8px_10px_0px_#0F4880]'
    >
      <div className='text-8xl w-full flex justify-center items-center h-44 '>
        {icon}
      </div>
      <h2 className='font-bold text-2xl text-center'>{title}</h2>
      <p className='text-neutral-950'>{description}</p>
    </motion.div>
  );
};

const Section3 = () => {
  const { address, isConnected } = useAccount();
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start({ y: 0, opacity: 1, transition: { duration: 1 } });
    } else {
      controls.start({ y: 20, opacity: 0 });
    }
  }, [controls, inView]);

  return (
    <section className='section3 bg-[#D2E9FF] flex justify-center items-center h-screen text-[#0F4880]tracking-tight'>
      <div className='container mx-auto flex flex-col w-full items-center text-center '>
        <motion.div
          ref={ref}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className='text-9xl w-full flex justify-center items-center h-44 text-[#0F4880] '
        >
          <SiBlockchaindotcom />
        </motion.div>
        <motion.h1
          ref={ref}
          initial={{ y: 20, opacity: 0 }}
          animate={controls}
          className='mx-4 text-5xl font-bold'
        >
          Create a Contract <br />
          <span className='text-[#0F4880] '>On-chain</span> and start your
          <br /> stress-free contract management
        </motion.h1>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {isConnected ? (
            <Link href={'/home'}>
              <div className='px-8 py-3 mt-12 text-lg rounded-3xl bg-[#0F4880] text-white'>
                Explore Gig Secured
              </div>
            </Link>
          ) : (
            <div className='px-8 py-3 mt-12 text-lg rounded-3xl bg-[#0F4880] text-white'>
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
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button onClick={openConnectModal} type='button'>
                              Connect Wallet
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button onClick={openChainModal} type='button'>
                              Wrong network
                            </button>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', gap: 12 }}>
                            <button
                              onClick={openChainModal}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              type='button'
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: 12,
                                    height: 12,
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                    marginRight: 4,
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? 'Chain icon'}
                                      src={chain.iconUrl}
                                      style={{ width: 12, height: 12 }}
                                    />
                                  )}
                                </div>
                              )}
                              {chain.name}
                            </button>

                            <button onClick={openAccountModal} type='button'>
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const Section4 = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start({ y: 0, opacity: 1, transition: { duration: 1 } });
    } else {
      controls.start({ y: 20, opacity: 0 });
    }
  }, [controls, inView]);

  return (
    <section className='section4 bg-[#D2E9FF] flex justify-center items-center h-screen text-[#0F4880]tracking-tight'>
      <div className='container mx-auto flex flex-col w-full items-center text-center '>
        <motion.div ref={ref} className='text-[#0F4880] text-9xl'>
          <FaHandshakeAngle />
        </motion.div>
        <div className='features-ca flex justify-between  items-center w-full py-10 mt-6 '>
          <motion.div
            ref={ref}
            initial={{ y: 20, opacity: 0 }}
            animate={controls}
            className='card text-[#0F4880] flex flex-col justify-center items-center gap-2  w-80 h-40  bg-[#0F4880] rounded-lg bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 p-8 shadow-[0px_8px_10px_0px_#0F4880]'
          >
            <h2 className=' font-bold text-2xl text-center'>
              Your Financial Security is our Priority{' '}
            </h2>
          </motion.div>
          <motion.div
            ref={ref}
            initial={{ y: 20, opacity: 0 }}
            animate={controls}
            className='card text-[#0F4880] flex flex-col justify-center items-center gap-2  w-80 h-40  bg-[#0F4880] rounded-lg bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 p-8  shadow-[0px_8px_10px_0px_#0F4880] '
          >
            <h2 className=' font-bold text-2xl text-center'>
              Quality Service Delivery is our Watchword{' '}
            </h2>
          </motion.div>
          <motion.div
            ref={ref}
            initial={{ y: 20, opacity: 0 }}
            animate={controls}
            className='card text-[#0F4880] flex flex-col justify-center items-center gap-2  w-80 h-40  bg-[#0F4880] rounded-lg bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-20 p-8 shadow-[0px_8px_10px_0px_#0F4880] '
          >
            <h2 className=' font-bold text-2xl text-center'>
              Seamless and Prompt Dispute Resolution
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default function Home() {
  const router = useRouter();
  const { address, isConnected, connector } = useAccount();
  // useEffect(() => {
  //   if (isConnected) {
  //     router.push("/home");
  //   }
  // }, [isConnected])
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start({ y: 0, opacity: 1, transition: { duration: 1 } });
    } else {
      controls.start({ y: 20, opacity: 0 });
    }
  }, [controls, inView]);

  return (
    <main className='overflow-y-scroll'>
      <div className='text-neutral-950 bg-[#D2E9FF] h-screen'>
        <nav className='flex justify-between bg-[#D2E9FF] items-center text-[#0F4880] px-12 fixed w-full z-10'>
          <div className='logo flex justify-center items-center   h-16 '>
            <MdOutlineWorkOutline className='text-3xl' />{' '}
            <span className='ml-2 font-bold text-2xl'>GigSecured</span>
          </div>
          <div className='text-[#0F4880] text-lg font-bold flex justify-center items-center gap-8'>
            <Link href={'/'}>
              <motion.span
                whileHover={{ borderBottom: '3px solid #0F4880' }}
                className='cursor-pointer py-2'
              >
                Home
              </motion.span>
            </Link>
            <Link href={'/'}>
              <motion.span
                whileHover={{ borderBottom: '3px solid #0F4880' }}
                className='cursor-pointer py-2'
              >
                Features
              </motion.span>
            </Link>
            <Link href={'/home'}>
              <motion.span
                whileHover={{ borderBottom: '3px solid #0F4880' }}
                className='cursor-pointer py-2'
              >
                Explore
              </motion.span>
            </Link>
          </div>
          {isConnected ? (
            <Link href={'/home'}>
              <button className='border-2 rounded-3xl border-[#0F4880] py-1 px-6'>
                Launch App
              </button>
            </Link>
          ) : (
            <div className='border-2 rounded-3xl border-[#0F4880] py-1 px-6 cursor-pointer'>
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
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button onClick={openConnectModal} type='button'>
                              Connect Wallet
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button onClick={openChainModal} type='button'>
                              Wrong network
                            </button>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', gap: 12 }}>
                            <button
                              onClick={openChainModal}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              type='button'
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: 12,
                                    height: 12,
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                    marginRight: 4,
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? 'Chain icon'}
                                      src={chain.iconUrl}
                                      style={{ width: 12, height: 12 }}
                                    />
                                  )}
                                </div>
                              )}
                              {chain.name}
                            </button>

                            <button onClick={openAccountModal} type='button'>
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          )}
        </nav>
        <section className='section1 h-full flex justify-center items-center'>
          <div className='container mx-auto flex flex-col w-full items-center text-center '>
            <h1 className='mx-4 text-7xl font-extrabold tracking-tight '>
              <span className='text-[#0F4880]'> Secure Escrow </span> and
              <br /> Talent Management Platform <br /> for Freelancers
            </h1>
            <p className='px-8 mt-12 mx-20 tracking-tight '>
              Our solution provides a secure, transparent, and efficient way for
              freelancers and clients to work together. Gig Secured aims to
              create a transparent, trustful, and fair environment for
              freelancers and clients to collaborate and exchange value.
              Freelancers and clients can create, accept, deliver, and review
              projects on the platform, and use the audit feature to resolve any
              disputes or issues.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {isConnected ? (
                <Link href={'/home'}>
                  <div className='px-8 py-3 mt-12 text-lg rounded-3xl bg-[#0F4880] text-white'>
                    Explore Gig Secured
                  </div>
                </Link>
              ) : (
                <div className='px-8 py-3 mt-12 text-lg rounded-3xl bg-[#0F4880] text-white'>
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
                      const ready =
                        mounted && authenticationStatus !== 'loading';
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
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <button
                                  onClick={openConnectModal}
                                  type='button'
                                >
                                  Connect Wallet
                                </button>
                              );
                            }

                            if (chain.unsupported) {
                              return (
                                <button onClick={openChainModal} type='button'>
                                  Wrong network
                                </button>
                              );
                            }

                            return (
                              <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                  onClick={openChainModal}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  type='button'
                                >
                                  {chain.hasIcon && (
                                    <div
                                      style={{
                                        background: chain.iconBackground,
                                        width: 12,
                                        height: 12,
                                        borderRadius: 999,
                                        overflow: 'hidden',
                                        marginRight: 4,
                                      }}
                                    >
                                      {chain.iconUrl && (
                                        <img
                                          alt={chain.name ?? 'Chain icon'}
                                          src={chain.iconUrl}
                                          style={{ width: 12, height: 12 }}
                                        />
                                      )}
                                    </div>
                                  )}
                                  {chain.name}
                                </button>

                                <button
                                  onClick={openAccountModal}
                                  type='button'
                                >
                                  {account.displayName}
                                  {account.displayBalance
                                    ? ` (${account.displayBalance})`
                                    : ''}
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              )}
            </motion.div>
          </div>
        </section>
        <section className='section2 bg-[#D2E9FF] flex justify-center items-center h-screen text-[#0F4880]tracking-tight'>
          <div className='container mx-auto flex flex-col w-full items-center text-center '>
            <h1 className='mx-4 text-5xl font-bold '>
              Our <span className='text-[#0F4880]'>Innovative</span> Features
            </h1>
            <div className='features-ca flex justify-between items-center w-full py-10 mt-6 '>
              <Card
                icon={<FaFileContract />}
                title='Smart Contract Escrow Service'
                description='Ensuring financial security for the freelance worker'
              />
              <Card
                icon={<LiaSearchengin />}
                title='Independent Auditing'
                description='Ensuring quality service delivering for clients through auditing reviews and applicable refunds.'
              />
              <Card
                icon={<BsCashCoin />}
                title='Low Fees'
                description='Pay as little as 2% to sign your contracts hiring a freelancer.'
              />
            </div>
          </div>
        </section>
        <Section3 />
        <Section4 />

        <footer className='bg-[#D2E9FF] px-12 mb-20 font-bold'>
          <div className='w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between'>
            <span className='text-sm text-[#0F4880] sm:text-center '>
              © 2023{' '}
              <span className='hover:underline'>
                GigSecured™
              </span>
              . All Rights Reserved.
            </span>
            <ul className='flex flex-wrap items-center mt-3 text-sm font-bold text-[#0F4880]  sm:mt-0'>
              <li>
                <Link href='#' className='hover:underline me-4 md:me-6'>
                  Home
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:underline me-4 md:me-6'>
                  Features{' '}
                </Link>
              </li>
              <li>
                <Link href='/home' className='hover:underline me-4 md:me-6'>
                  Explore
                </Link>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </main>
  );
}
