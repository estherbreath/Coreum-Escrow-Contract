/** @format */
'use client';
import Auth from '@/app/auth/Auth';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { auditorAddress } from '@/app/auth/contractAddress';
import auditAbi from '@/app/auth/abi/audit.json';
import { CgProfile } from 'react-icons/cg';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { PiArrowLeftBold } from 'react-icons/pi';
import { useRouter } from 'next/navigation';

export default function CreateBecomeAuditor() {
  const router = useRouter();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [termModal, setTermModal] = useState(false);
  const [hasOpenTermModal, setHasOpenTermModal] = useState(false);
  const [tx, setTx] = useState(null); // Add state for tx
  const { providerRead, providerWrite } = Auth();
  const { address, isConnected } = useAccount();
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    const contract = new ethers.Contract(
      auditorAddress,
      auditAbi,
      providerRead
    );
    const getConnectedWalletStatus = async () => {
      setLoadingPage(true);
      try {
        let tx = await contract.getCreatorSystem(address);
        // Use '===' instead of '=' for comparison
        if (tx === '0x0000000000000000000000000000000000000000') {
          setHasContract(false);
          setTx(tx);
        } else {
          setHasContract(true);
        }
      } catch (error) {
        console.error('Error fetching wallet status:', error);
      }
      setLoadingPage(false);
    };

    if (isConnected) {
      getConnectedWalletStatus();
    }
  }, [address, isConnected, tx]); // Include tx in dependencies

  const schema = yup
    .object({
      email: yup.string().email().required(),
      category: yup.string().required(),
      terms: yup
        .bool()
        .oneOf([true], 'You need to accept the terms and conditions'),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const openTermsModal = () => {
    setHasOpenTermModal(true);
    setTermModal(true);
  };

  // const onSubmit = async (data) => {
  //   console.log(data);
  //   if (!hasOpenTermModal) {
  //     return; // Handle the case where terms are not accepted
  //   }

  //   setSubmitLoading(true);
  //   try {
  //     const contract = new ethers.Contract(
  //       auditorAddress,
  //       auditAbi,
  //       providerWrite.getSigner() // Use providerWrite for sending transactions
  //     );

  //     const transaction = await contract.becomeAuditor(
  //       data.category,
  //       data.email
  //     );

  //     // Wait for the transaction to be mined and confirmed
  //     await transaction.wait();

  //     setTx(transaction.hash);

  //     setTimeout(() => {
  //       setSubmitLoading(false);
  //     }, 1000);
  //   } catch (error) {
  //     setSubmitLoading(false);
  //     toast.error(error.message);
  //     console.error('Error', error);
  //   }
  // };

  const onSubmit = async (data) => {
    console.log(data);

    if (!hasOpenTermModal) {
      return; // Handle the case where terms are not accepted
    }
    const signer = await providerWrite.getSigner();
    const contract = new ethers.Contract(
      auditorAddress,
      auditAbi,
      signer // Use providerWrite for sending transactions
    );

    setSubmitLoading(true);
    try {
      const transaction = await contract.becomeAuditor(
        data.category,
        data.email
      );

      // Wait for the transaction to be mined and confirmed
      transaction.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          setSubmitLoading(false)
          toast.success('Auditor registration successful!');
          router.push("/audits")
        }
      });

      setTx(transaction.hash);

    } catch (e) {
      if (e.data && contract) {
        const decodedError = contract.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setSubmitLoading(false);
      toast.error(e.message);
      console.error('Error', e);
    }
  };

  return (
    <div className='w-full text-black'>
      <form className='pt-20 pb-5' onSubmit={handleSubmit(onSubmit)}>
        <div className='flex items-center gap-4'>
          <PiArrowLeftBold
            size={28}
            className='font-bold cursor-pointer text-4xl mt-2'
            onClick={() => router.back()}
          />
          <div
            className={`bg-[#D9D9D9] personal_savings_card p-6 flex flex-col gap-4 justify-between w-full cursor-pointer `}
          >
            <span className='text-[20px] tracking-[0.085px] leading-5'>
              Start Your Journey as an Auditor
            </span>
            <span className='grotesk_font text-base tracking-[0.085px] leading-5'>
              Fill this form to become an auditor!
            </span>
          </div>
        </div>

        {/* form */}
        <div className='my-12'>
          <div className='grid md:flex gap-5 w-full mb-5'>
            <div className='grid space-y-2 w-full'>
              <label>Your Email</label>
              <input
                {...register('email')}
                type='text'
                placeholder='Please Enter Your Valid Email'
                className='input input-bordered  border-[#696969] w-full max-w-full bg-white'
              />
              <p className='text-field-error italic text-red-500'>
                {errors.email?.message}
              </p>
            </div>
          </div>
          <div className='grid md:flex gap-5 w-full mb-5'>
            <div className='grid space-y-2 w-full'>
              <label>Category</label>
              <select
                {...register('category')}
                className='select select-bordered border-[#696969] w-full max-w-full bg-white'
              >
                <option>
                  {/* Select Option? */}
                  Smart Contract Development
                </option>
                <option>Freelance Writing</option>
                <option>Art Sale</option>
                <option>Marketing</option>
                <option>Video Content</option>
              </select>
              <p className='text-field-error italic text-red-500'>
                {errors.category?.message}
              </p>
            </div>
          </div>
          <div className='grid space-y-1  w-full'>
            <button
              type='button'
              onClick={() => openTermsModal()}
              className='w-full h-[58px] rounded-lg underline text-[#3997b9] text-[17px] block mx-auto leading-[25.5px] tracking-[0.5%]'
            >
              View Terms and Conditions
            </button>
            <p className='text-field-error italic text-red-500 text-center '>
              {errors.terms?.message}
            </p>
          </div>
        </div>

        <button
          disabled={submitLoading}
          className='w-[360px] h-[58px] rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block mx-auto leading-[25.5px] tracking-[0.5%]'
        >
          {submitLoading ? (
            <span className='loading loading-spinner loading-lg'></span>
          ) : (
            'Become an Auditor'
          )}
        </button>
      </form>

      {/* Term and Conditions */}
      {termModal && (
        <div>
          <input
            type='checkbox'
            checked
            onChange={() => null}
            id='my_modal_6'
            className='modal-toggle'
          />
          <div className='modal bg-white'>
            <div className='modal-box w-11/12 max-w-5xl bg-white'>

              <div>
                <h3 className="font-bold text-lg">
                  Terms of Service for Auditors on Gig Secured!
                </h3>
                <hr className="text-black my-2" />
                <h4 className="mt-2 text-lg font-bold">Introduction</h4>
                <p>
                  Welcome to Gig Secured, a platform that provides freelancers
                  and clients with an escrow and talent management service based
                  on blockchain technology and smart contracts.
                </p>
                <p>
                  These terms of service govern your use of our platform and our
                  relationship with you as a freelancer. By using our platform,
                  you agree to be bound by these terms of service.
                </p>
                <p className="font-bold text-red-500 text-lg pt-2">
                  If you do not agree with these terms of service, please do not
                  use our platform.
                </p>

                <div>
                  <h4 className="mt-2 text-lg font-bold">Definitions</h4>
                  <ul className="list-disc py-3 px-4 grid space-y-1">
                    <li>
                      "We", "us", "our" refer to Gig Secured, the owner and
                      operator of the platform.
                    </li>
                    <li>
                      "You", "your" refer to you, the freelancer who uses our
                      platform to manage your relationship with clients.
                    </li>
                    <li>
                      "Platform" refers to our website and any other onchain or
                      online or offline services that we provide.
                    </li>
                    <li>
                      "Client" refers to any person or entity who uses our
                      platform to manage their relationships with freelancers
                      they hire for their projects (gigs).
                    </li>
                    <li>
                      "Contract" or “Gig” refers to the agreement or arrangement
                      that is formed between a freelancer and a client on our
                      platform for a project (gig).
                    </li>
                    <li>
                      "Smart contract" refers to any self-executing contract
                      that is created and executed on the blockchain and that
                      governs the terms and conditions of a project (gig).
                    </li>
                    <li>
                      "Escrow" refers to any service that we provide on our
                      platform that holds and releases the funds for a project
                      according to the smart contract.
                    </li>
                    <li>
                      "Auditor" refers to any person or entity who uses our
                      platform to provide an independent and impartial review of
                      the quality and outcome of a project (gig).
                    </li>
                    <li>
                      "Audit" refers to any process or procedure that is
                      initiated by a client or a freelancer on our platform to
                      request or perform an audit for a project (gig).
                    </li>
                    <li>
                      "Token" refers to any digital currency or asset that is
                      used on our platform for payments and transactions.
                    </li>
                    <li>
                      "Project Fee" refers to the fee you and the client agreed
                      to as your payment for a gig.
                    </li>
                    <li>
                      "Platform Fee" refers to the fee you and the client will
                      be charged for using our platform.
                    </li>
                  </ul>
                </div>
              </div>
              <div className='grid space-y-2 w-full'>
                <div className='flex gap-3 items-center'>
                  <input
                    {...register('terms')}
                    type='checkbox'
                    className='input input-bordered w-8 h-8 border-[#696969] max-w-full bg-white'
                  />
                  <label className='w-full'>Accept Terms and Conditions</label>
                </div>
              </div>
              <div className='modal-action' onClick={() => setTermModal(false)}>
                <label
                  htmlFor='my_modal_6'
                  className='btn btn-error text-white'
                >
                  Close!
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
