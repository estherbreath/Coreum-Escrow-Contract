import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { PiArrowLeftBold } from 'react-icons/pi'
import { FiEdit } from 'react-icons/fi'
import childAbi from '@/app/auth/abi/child.json'
import factoryAbi from '@/app/auth/abi/factory.json'
import vrfAbi from '@/app/auth/abi/vrf.json'
import { factoryAddress, vrfAddress } from "@/app/auth/contractAddress";
import { ethers } from "ethers";
import Auth from "@/app/auth/Auth";
import { useAccount } from 'wagmi'
import { calculateGasMargin, formatBlockchainTimestamp, formatStatus, shortenAccount } from '@/utils'
import { toast } from 'react-toastify'
import axios from 'axios'

export default function ViewContract() {
  const router = useRouter();
  const [contractDetails, setContractDetails] = useState(null)
  const [fileUrl, updateFileUrl] = useState(contractDetails ? contractDetails[6] : "");
  const [disputeFile, setDisputeFile] = useState("");
  const [newFile, updateNewFile] = useState();
  const [ipfsLoading, setIpfsLoading] = useState(false);

  const { address, isConnected } = useAccount();
  const { providerRead, providerWrite, providerSepolia } = Auth();
  const [loadingPage, setLoadingPage] = useState(true)
  const [hasContract, setHasContract] = useState(false)
  const [gigContract, setGigContract] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [errorMessageLink, setErrorMessageLink] = useState("")

  const [deadline, setDeadline] = useState("");
  const [title, setTitle] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [status, setStatus] = useState(3);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [showUpdateModal, setUpdateModal] = useState(false);
  const [forceCloseModal, setForceCloseModal] = useState(false);
  const [forceLoading, setForceClosing] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDescriptionModal, setDescriptionModal] = useState(false);
  const [showFreelancerModal, setFreelancerModal] = useState(false);
  const [showDeadlineModal, setFreelancerDeadlineModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateContractTitleLoading, setUpdateContractTitleLoading] = useState(false);
  const [updateContractCategoryLoading, setUpdateContractCategoryLoading] = useState(false);
  const [updateDescriptionLoading, setDescriptionLoading] = useState(false);
  const [updateDeadlineLoading, setUpdateDeadlineLoading] = useState(false);
  const searchParams = useSearchParams()

  const id = searchParams.get('id')


  const updateModalStatus = () => {
    setUpdateModal(true);
  };

  const getContractDetail = async (registerAddress) => {
    if (registerAddress === "0x0000000000000000000000000000000000000000") {
      return;
    }

    const signer = await providerWrite.getSigner();
    const contractRead = new ethers.Contract(registerAddress, childAbi, signer);
    let tx = await contractRead.getGig(Number(id));

    const tr = Object.values(tx)
    setContractDetails(tr)

    //set contract details
    setTitle(tr[0])
    setCategory(tr[1])
    setDescription(tr[6])
    // setFetchedContracts(tr)
  }


  useEffect(() => {
    const contract = new ethers.Contract(factoryAddress, factoryAbi, providerRead);
    const getConnectedWalletStatus = async () => {
      setLoadingPage(true)
      let tx = await contract.getCreatorSystem(address);
      if (tx === "0x0000000000000000000000000000000000000000") {
        setHasContract(false)
      } else {
        setHasContract(true)
        setGigContract(tx)
        getContractDetail(tx)
      }
      setLoadingPage(false)
    }
    if (isConnected) {
      getConnectedWalletStatus();
    }
  }, [])

  // const updateFreelancer = async () => {
  //   const signer = await providerWrite.getSigner();

  //   const contractWrite = new ethers.Contract(gigContract, childAbi, signer);

  //   if (title === "") {
  //     setErrorMessage("Please enter a title")
  //     return;
  //   }
  //   setUpdateContractTitleLoading(true);
  //   try {
  //     const estimatedGas = await contractWrite.editGigTitle.estimateGas(
  //       id, title
  //     );
  //     let tx = await contractWrite.editGigTitle(id, title, { gasLimit: calculateGasMargin(estimatedGas) });

  //     tx.wait().then(async (receipt) => {
  //       if (receipt && receipt.status == 1) {
  //         // transaction success.
  //         toast.success("Secured Contract title updated successfully")
  //         setUpdateContractTitleLoading(false)
  //         setShowTitleModal(false)
  //         const newArray = contractDetails;
  //         newArray[0] = title;
  //         setContractDetails(newArray)
  //       }
  //     });
  //   } catch (e) {
  //     if (e.data && contractWrite) {
  //       const decodedError = contractWrite.interface.parseError(e.data);
  //       toast.error(`Transaction failed: ${decodedError?.name}`)
  //     } else {
  //       console.log(`Error in contract:`, e);
  //     }
  //     setUpdateContractTitleLoading(false)
  //     setShowTitleModal(false)
  //   }
  // }

  async function uploadIPFS() {
    const file = newFile
    try {
      if (file !== undefined) {
        setIpfsLoading(true)
        const formData = new FormData();
        console.log(file)
        formData.append('file', file);
        const pinataBody = {
          options: {
            cidVersion: 1,
          },
          metadata: {
            name: file.name,
          }
        }
        formData.append('pinataOptions', JSON.stringify(pinataBody.options));
        formData.append('pinataMetadata', JSON.stringify(pinataBody.metadata));
        const url = `${pinataConfig.root}/pinning/pinFileToIPFS`;
        const response = await axios({
          method: 'post',
          url: url,
          data: formData,
          headers: pinataConfig.headers
        })
        {
          (status === "4" || status === 4) ?
            setDisputeFile(`ipfs://${response.data.IpfsHash}/`)
            :
            updateFileUrl(`ipfs://${response.data.IpfsHash}/`)
        }
        queryPinataFiles();
      } else {
        toast.error("Please upload a document detailing the project outlines, aims and objectives");
        return;
        setIpfsLoading(false)
      }
      setIpfsLoading(false)
    } catch (error) {
      setIpfsLoading(false)
      console.log(error)
    }
  }

  const queryPinataFiles = async () => {
    try {
      const url = `${pinataConfig.root}/data/pinList?status=pinned`;
      const response = await axios.get(url, pinataConfig);
    } catch (error) {
      console.log(error)
    }
  };

  const pinataConfig = {
    root: 'https://api.pinata.cloud',
    headers: {
      'pinata_api_key': "e98332f4fcdf7aa677fa",
      'pinata_secret_api_key': "ddba77116b8064d68c18b734f8b2fe484b18349b8a1c7af90006689e944ff59a"
    }
  };

  const testPinataConnection = async () => {
    try {
      const url = `${pinataConfig.root}/data/testAuthentication`
      const res = await axios.get(url, { headers: pinataConfig.headers });
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    testPinataConnection()
  });

  const forceCloseContract = async () => {
    const signer = await providerWrite.getSigner();

    const contractWrite = new ethers.Contract(gigContract, childAbi, signer);

    setForceClosing(true);
    try {
      // const estimatedGas = await contractWrite.updateGig.estimateGas(id, status);
      let tx = await contractWrite.forceClosure(id);
      tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          toast.success("Secured Contract status updated successfully")
          setForceClosing(false)
          setForceCloseModal(false)
          const newArray = contractDetails;
          newArray[9] = 5;
          setContractDetails(newArray)
          router.push("/contracts")
        }
      });
    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setForceClosing(false)
      setForceCloseModal(false)
    }
  }

  const updateStatus = async () => {
    if (contractDetails[5] === "0x") {
      toast.error("Freelancer hasn't started building yet")
      return;
    }
    if (status === "4" && jobLink === "") {
      setErrorMessageLink("You selected Dispute, please include a link to a document listing information about the work. This will help the assigned auditor review the work and make settlement")
      return;
    }

    const signer = await providerWrite.getSigner();

    const vrfSigner = new ethers.Wallet(process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY, providerSepolia);

    const contractWrite = new ethers.Contract(gigContract, childAbi, signer);
    const vrfRead = new ethers.Contract(vrfAddress, vrfAbi, vrfSigner);

    if (status === "null" || status === null) {
      setErrorMessage("Please select a status")
      return;
    }
    setSubmitLoading(true);
    try {
      if (status === 4 || status === "4") {
        // await vrfRead.requestRandomWords();

        let vrfNum = await vrfRead.getRandomWord();
        // Convert the big number to a string
        const numberString = vrfNum.toString();

        // Calculate three-quarters of the length
        const threeQuartersLength = Math.floor(numberString.length * 0.75);

        // Remove three-quarters of the length from the start of the string
        const reducedNumberString = numberString.slice(threeQuartersLength);
        const reducedNumber = BigInt(reducedNumberString);
        let tx = await contractWrite.updateGig(id, status, disputeFile, reducedNumber);
        tx.wait().then(async (receipt) => {
          if (receipt && receipt.status == 1) {
            // transaction success.
            toast.success("Secured Contract will now be settled by an external auditor")
            setSubmitLoading(false)
            setUpdateModal(false)
            const newArray = contractDetails;
            newArray[9] = status;
            setContractDetails(newArray)
          }
        });
      } else {
        let tx = await contractWrite.updateGig(id, status, disputeFile, 76528365);
        tx.wait().then(async (receipt) => {
          if (receipt && receipt.status == 1) {
            // transaction success.
            toast.success("Secured Contract status updated successfully")
            setSubmitLoading(false)
            setUpdateModal(false)
            const newArray = contractDetails;
            newArray[9] = status;
            setContractDetails(newArray)
          }
        });
      }

    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setSubmitLoading(false)
      setUpdateModal(false)
    }
  }
  const updateTitle = async () => {
    const signer = await providerWrite.getSigner();

    const contractWrite = new ethers.Contract(gigContract, childAbi, signer);

    if (title === "") {
      setErrorMessage("Please enter a title")
      return;
    }
    setUpdateContractTitleLoading(true);
    try {
      const estimatedGas = await contractWrite.editGigTitle.estimateGas(
        id, title
      );
      let tx = await contractWrite.editGigTitle(id, title, { gasLimit: calculateGasMargin(estimatedGas) });

      tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          toast.success("Secured Contract title updated successfully")
          setUpdateContractTitleLoading(false)
          setShowTitleModal(false)
          const newArray = contractDetails;
          newArray[0] = title;
          setContractDetails(newArray)
        }
      });
    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setUpdateContractTitleLoading(false)
      setShowTitleModal(false)
    }
  }
  const updateDesc = async () => {
    const signer = await providerWrite.getSigner();

    const contractWrite = new ethers.Contract(gigContract, childAbi, signer);

    if (fileUrl === "") {
      setErrorMessage("Please upload your new document")
      return;
    }
    setDescriptionLoading(true);
    try {
      const estimatedGas = await contractWrite.editGigDescription.estimateGas(
        id, fileUrl
      );
      let tx = await contractWrite.editGigDescription(id, fileUrl, { gasLimit: calculateGasMargin(estimatedGas) });

      tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          toast.success("Secured Contract project documentation updated successfully")
          setDescriptionLoading(false)
          setDescriptionModal(false)
          const newArray = contractDetails;
          newArray[6] = fileUrl;
          setContractDetails(newArray)
        }
      });
    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setDescriptionLoading(false)
      setDescriptionModal(false)
    }
  }
  const updateCategory = async () => {
    const signer = await providerWrite.getSigner();

    const contractWrite = new ethers.Contract(gigContract, childAbi, signer);

    if (title === "") {
      setErrorMessage("Please enter a category")
      return;
    }
    setUpdateContractCategoryLoading(true);
    try {
      const estimatedGas = await contractWrite.editGigTitle.estimateGas(
        id, category
      );
      let tx = await contractWrite.editGigCategory(id, category, { gasLimit: calculateGasMargin(estimatedGas) });

      tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          toast.success("Secured Contract category updated successfully")
          setUpdateContractCategoryLoading(false)
          setShowCategoryModal(false)
          const newArray = contractDetails;
          newArray[1] = category;
          setContractDetails(newArray)
        }
      });
    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setUpdateContractCategoryLoading(false)
    }
  }
  const updateDeadline = async () => {
    const signer = await providerWrite.getSigner();

    const contractWrite = new ethers.Contract(gigContract, childAbi, signer);

    if (deadline === "") {
      setErrorMessage("Please enter a deadline")
      return;
    }
    const deadlineFormat = Math.floor(new Date(deadline).getTime() / 1000)
    setUpdateDeadlineLoading(true);
    try {
      const estimatedGas = await contractWrite.editGigDeadline.estimateGas(
        id, deadlineFormat
      );
      let tx = await contractWrite.editGigDeadline(id, deadlineFormat, { gasLimit: calculateGasMargin(estimatedGas) });

      tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          toast.success("Secured Contract deadline updated successfully")
          setFreelancerDeadlineModal(false)
          setUpdateDeadlineLoading(false)
          const newArray = contractDetails;
          newArray[7] = Number(deadlineFormat);
          setContractDetails(newArray)
        }
      });
    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
      } else {
        console.log(`Error in contract:`, e);
      }
      setFreelancerDeadlineModal(false)
      setUpdateDeadlineLoading(false)
      setShowTitleModal(false)
    }
  }

  return (
    <div>
      {(loadingPage && !hasContract && contractDetails === null) &&
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

      {(!loadingPage && !hasContract && gigContract === "") &&
        <div
          className='px-3 py-4 text-center font-bold mx-auto rounded-lg mt-10 bg-[#D2E9FF] text-black text-xl block leading-[25.5px] tracking-[0.5%]'
        >
          No contracts register, Please proceed to Dashboard to create a register
        </div>
      }

      {(!loadingPage && hasContract && gigContract !== "" && contractDetails !== null) &&
        <div className='w-[96%] text-black'>
          <div className='flex gap-4 items-center pt-16'>
            <PiArrowLeftBold
              size={28}
              className='font-bold cursor-pointer text-4xl mt-2'
              onClick={() => router.back()}
            />
            <div className='funda_bg flex items-center justify-between w-full p-4'>
              <div>
                <div className='flex gap-2'>
                  <h2 className="font-normal text-[32px] leading-10 head2">{contractDetails[0]}</h2>
                  {formatStatus(contractDetails[9]) === "pending" &&
                    <button onClick={() => setShowTitleModal(true)}>
                      <FiEdit />
                    </button>
                  }
                </div>
                <div className='lg:flex items-center mt-2 gap-2'>
                  <span className='text-base block'>Category: {contractDetails[1]}</span>
                  {formatStatus(contractDetails[9]) === "pending" &&
                    <button onClick={() => setShowCategoryModal(true)}>
                      <FiEdit />
                    </button>
                  }
                </div>
              </div>
              <div>
                <div className='flex justify-end w-full items-center gap-2 mb-2'>
                  <span className='py-1 rounded-md bg-white px-2 block w-fit'>
                    {formatStatus(contractDetails[9])}
                  </span>
                  {Number(contractDetails[9]) < 4 &&
                    <button
                      onClick={() => updateModalStatus()}
                      className='w-fit p-2 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      Update Status
                    </button>
                  }
                  {Number(contractDetails[9]) === 0 &&
                    <button
                      onClick={() => setForceCloseModal(true)}
                      className='w-fit p-2 rounded-lg bg-red-500 hover:bg-red-800 text-[#fff] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      Force Close
                    </button>
                  }
                </div>

                <div className='flex items-center gap-2'>
                  <span>Freelancer Address:</span>
                  <span>{shortenAccount(contractDetails[4])}</span>
                  {/* {contractDetails[5] === "0x" &&
                    <button onClick={() => setFreelancerModal(true)}>
                      <FiEdit />
                    </button>
                  } */}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mb-0 flex justify-center gap-4 flex-col-reverse md:flex-row items-start pt-10 w-full h-full mx-0 py-0 px-11`}
          >
            <div className='flex-col gap-4 px-7 py-7 mx-4 sm:mx-0  w-full bg-white my-0 h-fit border-dashed border-2 border-black'>
              <div className=''>
                <div className='flex-col'>
                  <div>
                    <div className='mb-4 flex items-center gap-2'>
                      <label
                        className="block text-lg font-bold text-gray-700"
                        htmlFor="card_holder_name"
                      >
                        Deadline:
                      </label>
                      <div className="font-bold text-xl">
                        <span>{formatBlockchainTimestamp(Number(contractDetails[7]))}</span>
                      </div>
                      {formatStatus(contractDetails[9]) === "pending" &&
                        <button onClick={() => setFreelancerDeadlineModal(true)}>
                          <FiEdit />
                        </button>
                      }
                    </div>
                    <div className='mb-4 flex items-center gap-2'>
                      <label
                        className='block text-lg font-bold text-gray-700'
                        htmlFor='card_holder_name'
                      >
                        Client Email:
                      </label>
                      <div className="font-bold text-xl">
                        <span>{contractDetails[2]}</span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <label
                        className='block text-lg font-bold text-gray-700'
                        htmlFor='card_holder_name'
                      >
                        Freelancer Email:
                      </label>
                      <div className="font-bold text-lg">
                        <span>{contractDetails[3] === "" ? "n/a" : contractDetails[3]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='w-full items-center'>
              <div>
                {Number(contractDetails[9]) !== 5 &&
                  <h3 className="font-bold mt-5 text-xl">
                    Price: ${contractDetails[12] && ethers.formatUnits(contractDetails[12], 6)}0
                  </h3>
                }
                <div className='flex gap-2 mt-5'>
                  <h3 className='font-bold text-xl'>Project Documentation Link</h3>
                  {formatStatus(contractDetails[9]) === "pending" &&
                    <button onClick={() => setDescriptionModal(true)}>
                      <FiEdit />
                    </button>
                  }
                </div>
                <a href={contractDetails[6]} target='_blank' className="max-w-[300px] text-lg mb-4 underline">
                  {contractDetails[6]}
                </a>
              </div>
            </div>
          </div>


          {/* forceClose */}
          {forceCloseModal && (
            <div>
              <input
                type='checkbox'
                checked
                onChange={() => null}
                id='my_modal_6'
                className='modal-toggle'
              />
              <div className='modal bg-white'>
                <div className='modal-box bg-white'>
                  <h3 className='font-bold text-xl'>Force close the project!</h3>
                  <p className='font-bold text-base text-red-500 py-2'>Note that you will be closing this project since the freelancer hasn't signed yet OR completed after deadline</p>
                  <div className='grid space-y-2 w-full mt-1'>
                    <div className='flex gap-3 items-center'>
                      <div className='grid space-y-2 w-full'>
                      </div>
                    </div>
                  </div>
                  <div className='w-full flex gap-3 items-center justify-end mt-3'>
                    <div className='w-full' onClick={() => setForceCloseModal(false)}>
                      <label
                        htmlFor='my_modal_6'
                        className='btn btn-error w-full text-white'
                      >
                        Close!
                      </label>
                    </div>
                    <button
                      onClick={() => forceCloseContract()}
                      disabled={forceLoading}
                      className='w-full h-full py-3 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      {forceLoading ? (
                        <span className='loading loading-spinner loading-base'></span>
                      ) : (
                        'Proceed'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* updateDeadline */}
          {showDeadlineModal && (
            <div>
              <input
                type='checkbox'
                checked
                onChange={() => null}
                id='my_modal_6'
                className='modal-toggle'
              />
              <div className='modal bg-white'>
                <div className='modal-box bg-white'>
                  <h3 className='font-bold text-lg'>Change New Contract Deadline In the Future!</h3>
                  {/* <p className='font-bold text-xs text-red-500 py-2'>You can't change when freelancer has began work!</p> */}
                  <div className='grid space-y-2 w-full mt-1'>
                    <div className='flex gap-3 items-center'>
                      <div className='grid space-y-2 w-full'>

                        <input
                          onChange={(e) => setDeadline(e.target.value)}
                          value={deadline}
                          type='date'
                          className='input input-bordered  border-[#696969] w-full max-w-full bg-white'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='w-full flex gap-3 items-center justify-end mt-3'>
                    <div className='w-full' onClick={() => setFreelancerDeadlineModal(false)}>
                      <label
                        htmlFor='my_modal_6'
                        className='btn btn-error w-full text-white'
                      >
                        Close!
                      </label>
                    </div>
                    <button
                      onClick={updateDeadline}
                      disabled={updateDeadlineLoading}
                      className='w-full h-full py-3 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      {updateDeadlineLoading ? (
                        <span className='loading loading-spinner loading-md'></span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* updateTitle */}
          {showTitleModal && (
            <div>
              <input
                type='checkbox'
                checked
                onChange={() => null}
                id='my_modal_6'
                className='modal-toggle'
              />
              <div className='modal bg-white'>
                <div className='modal-box bg-white'>
                  <h3 className='font-bold text-lg'>Change Contract Title!</h3>
                  {/* <p className='font-bold text-xs text-red-500 py-2'>You can't change when freelancer has began work!</p> */}
                  <div className='grid space-y-2 w-full mt-1'>
                    <div className='flex gap-3 items-center'>
                      <div className='grid space-y-2 w-full'>

                        <input
                          // {...register('name')}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          type='text'
                          placeholder='Please Enter Your Email'
                          className='input input-bordered  border-[#696969] w-full max-w-full bg-white'
                        />
                        <p className='text-field-error italic text-red-500'>
                          {errorMessage.length > 0 && errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='w-full flex gap-3 items-center justify-end mt-3'>
                    <div className='w-full' onClick={() => setShowTitleModal(false)}>
                      <label
                        htmlFor='my_modal_6'
                        className='btn btn-error w-full text-white'
                      >
                        Close!
                      </label>
                    </div>
                    <button
                      onClick={updateTitle}
                      disabled={updateContractTitleLoading}
                      className='w-full h-full py-3 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      {updateContractTitleLoading ? (
                        <span className='loading loading-spinner loading-md'></span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* updateCategory */}
          {showCategoryModal && (
            <div>
              <input
                type='checkbox'
                checked
                onChange={() => null}
                id='my_modal_6'
                className='modal-toggle'
              />
              <div className='modal bg-white'>
                <div className='modal-box bg-white'>
                  <h3 className='font-bold text-lg'>Change Contract Category!</h3>
                  {/* <p className='font-bold text-xs text-red-500 py-2'>You can't change when freelancer has began work!</p> */}
                  <div className='grid space-y-2 w-full mt-1'>
                    <div className='flex gap-3 items-center'>
                      <div className='grid space-y-2 w-full'>
                        <select
                          onChange={(e) => setCategory(e.target.value)}
                          className="select select-bordered border-[#696969] w-full max-w-full bg-white"
                        >
                          <option value="Smart Contract Development">
                            {/* Select Option? */}
                            Smart Contract Development
                          </option>
                          <option value="Freelance Writing">Freelance Writing</option>
                          <option value="Art Sale">Art Sale</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Video Content">Video Content</option>
                        </select>

                        <p className='text-field-error italic text-red-500'>
                          {errorMessage.length > 0 && errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='w-full flex gap-3 items-center justify-end mt-3'>
                    <div className='w-full' onClick={() => setShowCategoryModal(false)}>
                      <label
                        htmlFor='my_modal_6'
                        className='btn btn-error w-full text-white'
                      >
                        Close!
                      </label>
                    </div>
                    <button
                      onClick={updateCategory}
                      disabled={updateContractCategoryLoading}
                      className='w-full h-full py-3 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      {updateContractCategoryLoading ? (
                        <span className='loading loading-spinner loading-md'></span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* updateDescription */}
          {showDescriptionModal && (
            <div>
              <input
                type='checkbox'
                checked
                onChange={() => null}
                id='my_modal_6'
                className='modal-toggle'
              />
              <div className='modal bg-white'>
                <div className='modal-box bg-white'>
                  <h3 className='font-bold text-lg'>Change Contract Project Documentation Link(only when freelancer hasn't signed)!</h3>
                  {/* <p className='font-bold text-xs text-red-500 py-2'>You can't change when freelancer has began work!</p> */}
                  <div className='grid space-y-2 w-full mt-3'>
                    <div className='flex gap-3 items-center'>
                      <div className='grid space-y-2 w-full'>
                        <div className="join w-full">
                          <input
                            onChange={(e) => updateNewFile(e.target.files[0])}
                            type="file"
                            className="input pt-2 input-bordered  border-[#696969] w-full max-w-full bg-white placeholder::mt-2" />
                          <button
                            disabled={ipfsLoading}
                            onClick={() => uploadIPFS()}
                            className="btn join-item rounded-r-full bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE]">
                            {ipfsLoading ? "Uploading" : "Upload"}
                          </button>
                        </div>
                        {fileUrl !== "" &&
                          <div className="grid space-y-2 mt-2 w-full">
                            <label>Uploaded Document Link</label>
                            <input
                              value={fileUrl}
                              disabled
                              type="text"
                              className="input input-bordered text-black  border-[#696969] w-full max-w-full bg-white disabled:bg-white"
                            />
                          </div>
                        }
                        {fileUrl === '' &&
                          <p className='text-field-error italic text-red-500'>
                            {errorMessage.length > 0 && errorMessage}
                          </p>
                        }
                      </div>
                    </div>
                  </div>
                  <div className='w-full flex gap-3 items-center justify-end mt-3'>

                    <div className='w-full' onClick={() => setDescriptionModal(false)}>
                      <label
                        htmlFor='my_modal_6'
                        className='btn btn-error w-full text-white'
                      >
                        Close!
                      </label>
                    </div>
                    <button
                      onClick={updateDesc}
                      disabled={updateDescriptionLoading || fileUrl === ""}
                      className={`${fileUrl === "" ? "cursor-not-allowed opacity-10" : "hover:bg-[#684df0]"} w-full h-full py-3 rounded-lg bg-[#2A0FB1] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]`}
                    >
                      {updateDescriptionLoading ? (
                        <span className='loading loading-spinner loading-md'></span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* updateFreelancer */}
          {/* {showFreelancerModal && (
            <div>
              <input
                type='checkbox'
                checked
                onChange={() => null}
                id='my_modal_6'
                className='modal-toggle'
              />
              <div className='modal bg-white'>
                <div className='modal-box bg-white'>
                  <h3 className='font-bold text-lg'>Change Gig Contract Freelancer (only if the previous freelancer hasn't signed!)</h3>
                  <div className='grid space-y-2 w-full mt-6'>
                    <div className='block space-y-2 w-full'>

                      <input
                        type='text'
                        placeholder='Please Enter New Freelancer Email'
                        className='input input-bordered  border-[#696969] w-full max-w-full bg-white'
                      />
                      <input
                        type='text'
                        placeholder='Please Enter New Freelancer Address'
                        className='input input-bordered  border-[#696969] w-full max-w-full bg-white'
                      />
                    </div>
                  </div>
                  <div className='w-full flex gap-3 items-center mt-3'>
                    <div className='w-full' onClick={() => setFreelancerModal(false)}>
                      <label
                        htmlFor='my_modal_6'
                        className='btn btn-error w-full text-white'
                      >
                        Close!
                      </label>
                    </div>
                    <button
                      disabled={submitLoading}
                      className='w-full h-full py-3 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      {submitLoading ? (
                        <span className='loading loading-spinner loading-lg'></span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* updateStatusModal */}
          {showUpdateModal && (
            <div>
              <input
                type='checkbox'
                checked
                onChange={() => null}
                id='my_modal_6'
                className='modal-toggle'
              />
              <div className='modal bg-white'>
                <div className='modal-box bg-white'>
                  <h3 className='font-bold text-lg'>Change Contract Status!</h3>

                  <div className='grid space-y-2 w-full'>
                    <div className='flex gap-3 items-center'>
                      <div className='grid space-y-2 w-full'>
                        <select onChange={(e) => setStatus(e.target.value)} className='select select-bordered mt-6 border-[#696969] w-full max-w-full bg-white'>
                          <option value={3} selected>
                            UnderReview
                          </option>
                          <option value={4}>Lodge A Dispute</option>
                          <option value={5}>Close</option>
                        </select>
                        <p className='text-field-error italic text-red-500'>
                          {errorMessage.length > 0 && errorMessage}
                        </p>
                      </div>
                    </div>
                    {status === "4" &&
                      <div>
                        <div className="join w-full">
                          <input
                            onChange={(e) => updateNewFile(e.target.files[0])}
                            type="file"
                            className="input pt-2 input-bordered  border-[#696969] w-full max-w-full bg-white placeholder::mt-2" />
                          <button
                            disabled={ipfsLoading}
                            onClick={() => uploadIPFS()}
                            className="btn join-item rounded-r-full bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE]">
                            {ipfsLoading ? "Uploading" : "Upload"}
                          </button>
                        </div>
                        {disputeFile !== "" &&
                          <div className="block space-y-2 mt-3 w-full">
                            <label>Uploaded Document Link</label>
                            <input
                              value={disputeFile}
                              disabled
                              type="text"
                              className="input input-bordered text-black  border-[#696969] w-full max-w-full bg-white disabled:bg-white"
                            />
                          </div>
                        }
                        {disputeFile === '' &&
                          <p className='text-field-error italic text-red-500'>
                            {errorMessage.length > 0 && errorMessage}
                          </p>
                        }
                      </div>
                    }
                  </div>

                  <div className='w-full flex gap-3 items-center justify-end mt-3'>
                    <div className='w-full' onClick={() => { setUpdateModal(false); setStatus(3) }}>
                      <label
                        htmlFor='my_modal_6'
                        className='btn btn-error w-full text-white'
                      >
                        Close!
                      </label>
                    </div>
                    <button
                      disabled={submitLoading}
                      onClick={() => updateStatus()}
                      className='w-full h-full py-3 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block leading-[25.5px] tracking-[0.5%]'
                    >
                      {submitLoading ? (
                        <span className='loading loading-spinner loading-base'></span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    </div>
  );
}
