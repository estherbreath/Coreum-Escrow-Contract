import Auth from '@/app/auth/Auth';
import { ethers } from 'ethers';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PiArrowLeftBold } from 'react-icons/pi';
import childAbi from '@/app/auth/abi/child.json'
import { formatBlockchainTimestamp } from '@/utils';
import { toast } from 'react-toastify';

export default function ViewAudit() {
  const router = useRouter();
  const { providerRead, providerWrite } = Auth();
  const [submitLoading, setSubmitLoading] = useState(false);
  const searchParams = useSearchParams()
  const [contractDetails, setContractDetails] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true)

  const id = searchParams.get('id')
  const contract = searchParams.get('contract')

  const [progress, setProgress] = useState([0, 0, 0, 0]);
  const [inputValue, setInputValue] = useState(0);
  const [showUpdateModal, setUpdateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState(1);

  const handleBoxClick = (index) => {
    const newProgress = Array(4).fill(0);
    newProgress[index] = 100;
    setProgress(newProgress);

    // Set the input value to the corresponding value (e.g., 20, 40, 60, 80)
    setInputValue(20 + index * 20);
  };

  useEffect(() => {
    const getContractDetail = async () => {
      setLoadingPage(true)
      try {
        const signer = await providerWrite.getSigner();
        const contractWrite = new ethers.Contract(contract, childAbi, signer);
        let tx = await contractWrite.getGig(Number(id));

        const tr = Object.values(tx)
        setContractDetails(tr)
        setLoadingPage(false)

      } catch (e) {
        if (e.data && contractWrite) {
          const decodedError = contractWrite.interface.parseError(e.data);
          toast.error(`Transaction failed: ${decodedError?.name}`)
        } else {
          console.log(`Error in contract:`, e);
        }
        setLoadingPage(false)
      }
    }
    if (!!contract && !!id) {
      getContractDetail();
    }
  }, [])

  const auditContract = async () => {
    setSubmitLoading(true)
    let val = inputValue;
    const signer = await providerWrite.getSigner();
    const contractWrite = new ethers.Contract(contract, childAbi, signer);
    if (Number(inputValue) == 100) {
      val = 92;
    }
    try {
      let tx = await contractWrite.sendPaymentAfterAuditorSettle(id, val);
      tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          toast.success("Contract Audit Finalized and Payment sent out");
          setSubmitLoading(false)
          const newArray = contractDetails;
          newArray[9] == 5;
          setContractDetails(newArray)
        }
      });
      setSubmitLoading(false)

    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setSubmitLoading(false)
    }
  }

  return (
    <div className='w-[96%] text-black'>
      {(loadingPage && contractDetails.length < 0) &&
        <div role='status' className="flex justify-center mt-10 w-full">
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
      }
      {(!loadingPage && contract && !!contractDetails) &&
        <><div className='flex gap-4 items-center pt-16'>
          <PiArrowLeftBold
            size={28}
            className='font-bold cursor-pointer text-4xl mt-2'
            onClick={() => router.back()} />
          <div className='funda_bg flex items-center justify-between w-full p-4'>
            <div>
              <h2 className='font-normal text-[32px] leading-10 head2'>
                {contractDetails[0]}
              </h2>
              <span className='text-base pt-2 block'>
                Category: {contractDetails[1]}
              </span>
            </div>
            <div>
              <h2 className='text-xl my-4'>Contract Deadline: {formatBlockchainTimestamp(Number(contractDetails[7]))}</h2>
            </div>
          </div>
        </div><div
          className={`mb-0 flex justify-center gap-4 flex-col-reverse md:flex-row items-start pt-10 w-full h-full mx-0 p-0`}
        >
            <div className='w-full'>
              <div>
                <h2 className='max-w-full text-xl mt-4'>Project Documentation Link</h2>
                <a href={contractDetails[6]} target='_blank' className="max-w-[300px] text-lg mb-4 underline">
                  {contractDetails[6]}
                </a>
              </div>
              <div>
                <h2 className='max-w-full text-xl mt-4'>Job Documentation Link <span className='text-xs font-bold text-red-500'>(this is a link to the work executed, please review and select a value that shows the percentage of work done)</span></h2>
                <a href={contractDetails[15]} target='_blank' className='max-w-[300px] text-lg mb-4 underline'>
                  {contractDetails[15]}
                </a>
              </div>
              {Number(contractDetails[9]) !== 5 &&
                <div>
                  <div className='flex items-center mt-4'>
                    {progress.map((percentage, index) => (
                      <div
                        key={index}
                        className='w-1/4 p-2 cursor-pointer'
                        onClick={() => handleBoxClick(index)}
                      >
                        <div className='relative h-10 bg-gray-200 flex justify-center items-center'>
                          <div
                            className='absolute h-full bg-blue-500 flex justify-center items-center'
                            style={{ width: `${percentage}%` }}
                          >
                            <div className='text-center text-black z-10'>
                              {20 + index * 20}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <input
                      type='number'
                      className='h-10 bg-gray-200 px-4'
                      placeholder='1'
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)} />
                  </div>
                  <button
                    onClick={() => auditContract()}
                    disabled={submitLoading || inputValue < 10}
                    className={`${(submitLoading || Number(inputValue) < 10) && "cursor-not-allowed"} btn bg-[#D2E9FF] hover:bg-[#76bbff] text-black border-[#D2E9FFborder w-full mx-2 mt-4 h-10`}>
                    {submitLoading ? (
                      <span className="loading loading-spinner loading-lg"></span>
                    ) : (
                      "Complete Audit"
                    )}
                  </button>
                </div>
              }
            </div>
          </div></>
      }
    </div>
  );
}
