/** @format */
'use client';
import React, { useContext } from 'react';

import { useAppContext } from './Context';
import { ethers } from 'ethers';

export default function Auth() {
  const {
    provider,
    setProvider,
    setErrMessage,
    wallet,
    setWallet,
    address,
    setAddress,
    isLoading,
    setIsLoading,
    isConnected,
    setIsConnected,
    factoryContract,
    setFactoryContract,
    gigSecuredAddress,
    setGigSecuredAddress,
    setAuditorsContract,
    auditorsContract,
  } = useAppContext();

  const providerRead = new ethers.getDefaultProvider(
    'https://base-goerli.g.alchemy.com/v2/pEWkV5B_TfdqO_SzQ7NYfp5tyvQO0BvK'
  );
  const providerSepolia = new ethers.JsonRpcProvider(
    'https://eth-sepolia.g.alchemy.com/v2/PN7ox_cWivKpFnRnE5YKoJ5Vyp8-Bx5j'
  );

  let providerWrite;

  if (typeof window !== "undefined" && window && window?.ethereum) {
    providerWrite = new ethers.BrowserProvider(window?.ethereum);
  }

  // const createWallet = async () => {
  //   try {
  //     const localStorageAddress = window.localStorage.getItem("walletAddress");
  //     if (localStorageAddress) {
  //       setIsLoading(true);
  //       await instance.connect(localStorageAddress);
  //       setAddress(instance.getAddress());
  //       const instanceProvider = new ComethProvider(instance);
  //       setProvider(instanceProvider);

  //       const FactoryContract = new ethers.Contract(
  //         factoryAddress,
  //         factoryAbi,
  //         instanceProvider.getSigner()
  //       );

  //       setFactoryContract(FactoryContract);
  //       const tx = await FactoryContract._returnAddress(instance.getAddress());
  //       setChildAddress(tx);
  //     } else {
  //       setIsLoading(true);
  //       await instance.connect();
  //       const walletAddress = instance.getAddress();
  //       window.localStorage.setItem("walletAddress", walletAddress);
  //       setAddress(instance.getAddress());
  //       const instanceProvider = new ComethProvider(instance);

  //       const FactoryContract = new ethers.Contract(
  //         factoryAddress,
  //         factoryAbi,
  //         instanceProvider.getSigner()
  //       );
  //       setFactoryContract(FactoryContract);

  //       const tx = await FactoryContract.createAccount();
  //       // setTransactionSended(tx);
  //       const txResponse = await tx.wait();

  //       setProvider(instanceProvider);

  //       const tx2 = await FactoryContract._returnAddress(instance.getAddress());

  //       await fetch("https://api.connect.cometh.io/sponsored-address", {
  //         method: "post",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "apisecret": "b51787f8-2247-4ae2-88a6-d8cdc1bc38e6",
  //         },
  //         body: JSON.stringify({
  //           targetAddress: tx2,
  //         }),
  //       })
  //       setChildAddress(tx);
  //     }
  //     setWallet(instance);
  //     setIsConnected(true);
  //     setIsLoading(false);
  //     console.log("trans complete");
  //   } catch (error) {
  //     setErrMessage(error.message);
  //     console.log("error", error.message);
  //   }
  // };

  const disconnect = async () => {
    if (wallet) {
      try {
        await wallet.logout();
        setIsConnected(false);
        setWallet(null);
        setProvider(null);
        setAddress('');
      } catch (e) {
        console.log(e.message);
        // displayError((e ).message);
      }
    }
  };

  return {
    // createWallet,
    disconnect,
    provider,
    setProvider,
    setErrMessage,
    wallet,
    setWallet,
    address,
    setAddress,
    isLoading,
    setIsLoading,
    isConnected,
    setIsConnected,
    factoryContract,
    setFactoryContract,
    providerRead,
    providerWrite,
    providerSepolia,
    setGigSecuredAddress,
    gigSecuredAddress
    // childAddress,
    // setChildAddress,
  };
}
