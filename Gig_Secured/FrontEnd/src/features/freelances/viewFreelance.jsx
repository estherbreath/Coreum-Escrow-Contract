import Auth from '@/app/auth/Auth';
import { ethers } from 'ethers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PiArrowLeftBold } from 'react-icons/pi';
import childAbi from '@/app/auth/abi/child.json'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { formatBlockchainTimestamp, formatStatus, isTimestampGreaterThanCurrent, shortenAccount } from '@/utils';
import { toast } from 'react-toastify';
import { vrfAddress } from '@/app/auth/contractAddress';
import vrfAbi from '@/app/auth/abi/vrf.json'
import axios from 'axios'

export default function ViewFreelance() {
  const router = useRouter();
  const { providerRead, providerWrite, providerSepolia } = Auth();
  const [showUpdateModal, setUpdateModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [termModal, setTermModal] = useState(false);
  const searchParams = useSearchParams()
  const [status, setStatus] = useState(1);
  const [jobLink, setJobLink] = useState("");
  const [disputeFile, setDisputeFile] = useState("");
  const [newFile, updateNewFile] = useState();
  const [ipfsLoading, setIpfsLoading] = useState(false);

  const [errorMessageLink, setErrorMessageLink] = useState("")

  const [errorMessage, setErrorMessage] = useState("")
  const [contractDetails, setContractDetails] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true)

  const id = searchParams.get('id')
  const contract = searchParams.get('contract')

  const updateModal = () => {
    setUpdateModal(true);
  };

  const schema = yup
    .object({
      terms: yup
        .bool()
        .oneOf([true], "You need to accept the terms and conditions"),
    })
    .required();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const signContract = async () => {
    if (getValues("terms") === false || getValues("terms") === undefined || getValues("terms") === null || getValues("terms") === "false" || getValues("terms") === "off") {
      toast.error("please accept terms and conditions")
      return;
    }
    setSignLoading(true)
    const signer = await providerWrite.getSigner();
    const contractWrite = new ethers.Contract(contract, childAbi, signer);
    try {

      // Define the corresponding struct type in Solidity
      const myStructType = ["address", "string", "uint", "uint", "uint"];
      const myStructData = [contractDetails[4], contractDetails[0], id, contractDetails[12], contractDetails[7]];

      // Pack the struct data
      const packedData = ethers.solidityPackedKeccak256(myStructType, myStructData);
      const message = ethers.getBytes(packedData)
      let sig = await signer.signMessage(message);

      // const recoveredSigner = ethers.verifyMessage(ethers.getBytes(packedData), sig);
      // const splitSig = ethers.Signature.from(sig)
      // console.log(ethers.Signature.from(splitSig).serialized)
      // console.log(sig)

      let tx = await contractWrite.freeLancerSign(signer.address, sig, id);
      setTermModal(false)
      tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          // transaction success.
          toast.success("Contract signature successful");
          setSignLoading(false)
          const newArray = contractDetails;
          newArray[5] = sig;
          setContractDetails(newArray)
        }
      });

    } catch (e) {
      if (e.data && contractWrite) {
        const decodedError = contractWrite.interface.parseError(e.data);
        toast.error(`Transaction failed: ${decodedError?.name}`)
        console.log(decodedError)
        console.log(contractDetails)
      } else {
        console.log(`Error in contract:`, e);
      }
      setSignLoading(false)
    }
  }

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
        setDisputeFile(`ipfs://${response.data.IpfsHash}/`)
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

  // async function sendEmail() {
  //   try {

  //     const response = await fetch('/api/status', {
  //       method: 'post',
  //       body: JSON.stringify({ newStatus: formatStatus(status), toEmail: contractDetails[2], contractName: contractDetails[0] }),
  //     });

  //     if (!response.ok) {
  //       console.log("falling over")
  //       throw new Error(`response status: ${response.status}`);
  //     }
  //     const responseData = await response.json();
  //     console.log(responseData['message'])

  //     toast.success('Message successfully sent');
  //   } catch (err) {
  //     console.error(err);
  //     setSubmitLoading(false)
  //     toast.success("Error, please try resubmitting the form");
  //   }
  // }

  const updateStatus = async () => {
    if (contractDetails[5] === "0x") {
      setUpdateModal(false);
      toast.error("You need to sign before you can update status")
      return;
    }
    if (status === "4" && jobLink === "") {
      setErrorMessageLink("You selected Dispute, please include a link to a document listing information about the work. This will help the assigned auditor review the work and make settlement")
      return;
    }
    let randomNum = "30193865";
    const signer = await providerWrite.getSigner();

    const vrfSigner = new ethers.Wallet(process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY, providerSepolia);

    const contractWrite = new ethers.Contract(contract, childAbi, signer);
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
        let _randomNum = String(vrfNum)
        let tx = await contractWrite.updateGig(id, status, jobLink, _randomNum.slice(0, 50));
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
        let tx = await contractWrite.updateGig(id, status, jobLink, randomNum);
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
    setErrorMessage("")
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
          <div className='funda_bg md:flex items-center justify-between w-full p-4'>
            <div>
              <h2 className='font-normal text-[32px] leading-10 head2'>
                {contractDetails[0]}
              </h2>
              <span className='text-base pt-2 block'>
                Category: {contractDetails[1]}
              </span>
            </div>
            <div>
              <div className='flex items-center md:justify-end gap-2 mb-2'>
                {!(isTimestampGreaterThanCurrent(Number(contractDetails[7]))) &&
                  <span className='py-1 rounded-md bg-white px-2 block w-fit'>
                    {formatStatus(contractDetails[9])}
                  </span>
                }
                {(!(isTimestampGreaterThanCurrent(Number(contractDetails[7]))) && Number(contractDetails[9]) < 4) &&
                  <button
                    onClick={() => updateModal()}
                    className='w-fit p-2 rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-base block leading-[25.5px] tracking-[0.5%]'
                  >
                    Update Status
                  </button>
                }
                {((isTimestampGreaterThanCurrent(Number(contractDetails[7]))) && Number(contractDetails[9]) < 2) &&
                  <span className='py-1 rounded-md bg-red-500 text-white px-2 block w-fit'>
                    Expired
                  </span>
                }
              </div>


              <div className='grid md:flex items-center gap-2'>
                <span>Creator Address:</span>
                <span>{shortenAccount(contractDetails[4])}</span>
              </div>
            </div>
          </div>
        </div><div
          className={`mb-0 flex justify-center flex-col-reverse md:flex-row items-start pt-10 w-full h-full mx-0 p-0`}
        >
            <div className='w-full mx-10'>
              {Number(contractDetails[9]) !== 5 &&
                <div>
                  <h2 className='text-xl my-4'>Price: ${contractDetails[12] && ethers.formatUnits(contractDetails[12], 6)}0</h2>
                </div>
              }
              <div>
                <h2 className='text-xl font-bold my-4'>Deadline: {formatBlockchainTimestamp(Number(contractDetails[7]))}</h2>
              </div>
              <div>
                <h2 className='font-bold text-xl'>Project Documentation Link</h2>
                <a href={contractDetails[6]} target='_blank' className="max-w-[300px] text-lg mb-4 underline">
                  {contractDetails[6]}
                </a>
              </div>

              {(contractDetails[5] === "0x" && Number(contractDetails[9]) < 5) &&
                <button
                  disabled={signLoading}
                  onClick={() => setTermModal(true)} className='border mt-4 w-full h-fit py-2 btn bg-[#D2E9FF] hover:bg-[#76bbff] text-black border-[#D2E9FF'>
                  {signLoading ? (
                    <span className="loading loading-spinner loading-lg"></span>
                  ) : (
                    "Accept Terms and Sign"
                  )}
                </button>
              }
              {(contractDetails[5] === "0x" && Number(contractDetails[9]) === 5) &&

                <button
                  className='border mt-4 w-fit h-fit py-2 btn bg-[#D2E9FF] hover:bg-[#76bbff] cursor-not-allowed text-black border-[#D2E9FF'>
                  This contract has been closed, No action is allowed
                </button>
              }
              {Number(contractDetails[9]) === 4 &&

                <button
                  className='border mt-4 w-fit h-fit py-2 btn bg-[#D2E9FF] hover:bg-[#76bbff] cursor-not-allowed text-black border-[#D2E9FF'>
                  This contract execution is currently in dispute, Awaiting an Auditor review
                </button>
              }
            </div>
          </div></>
      }
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
                      <option value={1}>
                        Building
                      </option>
                      <option value={2}>Completed</option>
                      <option value={4}>Dispute</option>
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
                <div className='w-full' onClick={() => setUpdateModal(false)}>
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

      {/* terms */}
      {termModal &&
        <div>
          <input
            type="checkbox"
            checked
            onChange={() => null}
            id="my_modal_6"
            className="modal-toggle"
          />
          <div className="modal bg-white">
            <div className="modal-box w-11/12 max-w-5xl bg-white">

              <div>
                <h3 className="font-bold text-lg">
                  Terms of Service for Freelancers on Gig Secured!
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

                <h4 className="mt-2 text-lg font-bold">Scope of Service</h4>
                <p>
                  We provide a platform that manages how clients and freelancers
                  manage their project’s (gig) relationship using an escrow
                  service based on blockchain technology and smart contracts.
                </p>
                <p>
                  We do not provide any work or services ourselves, nor do we
                  guarantee the quality, accuracy, or reliability of any work or
                  services provided by freelancers or clients on our platform.
                </p>
                <p>
                  We are not a party to any contract or agreement that is formed
                  between freelancers and clients on our platform, nor are we
                  responsible for any disputes or issues that may arise between
                  them. We are not liable for any damages or losses that may
                  result from the use of our platform or the work or services
                  provided by freelancers or clients on our platform.
                </p>

                <h4 className="mt-2 text-lg font-bold">Usage</h4>
                <p>To use our platform as a freelancer, you only need to:</p>
                <ul className="list-disc py-3 px-4 grid space-y-1">
                  <li>Accept the terms of the contract by your signature.</li>
                  <li>
                    Use a compactible Web 3 wallet client like Base or Metamask
                    wallets and email for verification and signature.
                  </li>
                  <li>Agree to our terms of service and privacy policy.</li>
                </ul>

                <p>
                  You are responsible for maintaining the security and
                  confidentiality of every gig you are working on. You are also
                  responsible for any activities or actions that occur under
                  your account. You agree to notify us immediately if you have
                  any difficulty accessing a gig you are working on or if your
                  wallet has been compromised.
                </p>

                <h4 className="mt-2 text-lg font-bold">Gigs</h4>
                <p>
                  You are responsible for meeting your client and agreeing with
                  your client all the terms, requirements and milestones before
                  coming to sign a contract on our platform. Our platform allows
                  you to review a contract you have been invited to sign. It is
                  your responsibility to ensure that the contract you are
                  signing is based on the terms of your agreement. Our platform
                  recieves payment from the client as security of guaranteed
                  payment for you, secures the payment on the blockchain and
                  handles settlement when the contract is finalised.
                </p>

                <p className="text-red-500 py-1">
                  You must sign the contract and before you can change the
                  status from ‘Pending’ to ‘Building.’
                </p>

                <div>
                  <h4 className="font-bold text-lg mt-2">Deadlines</h4>
                  <div>
                    <h5>
                      Our platform handles deadlines set by the client for you
                      in these manner:
                    </h5>
                    <ul className="list-disc py-3 px-4 grid space-y-1">
                      <li>
                        If you are invited to sign a contract and you fail to
                        sign the contract within 72 hours, the client will be
                        able to close the contract and get refunded the amount
                        he put up in accordance with these terms of service.
                      </li>
                      <li>
                        If you accept a gig from the client, you sign and fail
                        to complete it within the agreed deadline, the contract
                        will fail and revert, refunds would be made to the
                        client who created the contract, so endeavour to submit
                        your work within the agreed time as time cannot be
                        changed once a contract is created.
                      </li>
                    </ul>
                  </div>
                </div>

                <p>
                  <strong>
                    All these are done to foster accountability and adherence to
                    contractual obligations.
                  </strong>
                </p>

                <h4 className="font-bold text-lg mt-2">
                  Contracts and Smart Contracts
                </h4>
                <p>
                  When you and the client agree on a gig, the client would come
                  to our platform and create a contract with all the details you
                  have agreed and invite you to sign. The contract specifies the
                  terms, requirements, and milestones of the project.
                </p>

                <p className="font-bold text-red-500 text-lg pt-2">
                  Our platform, this terms of service and our privacy policy
                  cover the rights and obligations of both parties.
                </p>

                <p>
                  When a contract is formed, a smart contract is also created
                  and deployed on the blockchain. The smart contract is a
                  self-executing contract that governs the terms and conditions
                  of the gig, such as the payment, the delivery, the review,
                  possible audits, and rating. The smart contract is immutable
                  and transparent, and can be verified by anyone on the
                  blockchain.
                </p>

                <p className="font-bold text-red-500 text-lg pt-2">
                  You agree to abide by the terms and conditions of the
                  contract, and to perform the work or services according to the
                  agreed milestones and deliverables.
                </p>

                <h4 className="mt-2 text-lg font-bold">
                  Escrow, Payments and Audits
                </h4>
                <p>
                  When a contract is formed, the client is required to deposit
                  the project fee plus an additional 12% for the possible audit
                  service as part of the platform fees. The project fee is the
                  amount that is agreed by you and the client for the gig. The
                  audit service is the service that we provide on our platform
                  that allows you or the client to request for an audit for a
                  completed gig.
                </p>

                <p>
                  We hold the project and platform fees in escrow on our
                  platform through the smart contract until the project is
                  completed, verified and closed. The escrow is a service that
                  we provide on our platform that holds and releases the funds
                  for the project according to the smart contract.
                </p>

                <p>
                  When you deliver the work or services according to the agreed
                  milestones and deliverables, you need to request payment from
                  the client on our platform. You make this request by updating
                  the gig status to ‘Completed.’ When the the client reviews the
                  work or services that you deliver, they confirm their
                  satisfaction by updating the status of the contract from
                  ‘Under Review’ to ‘Closed’ or they can dispute the completed
                  work by requesting an audit on our platform.
                </p>

                <p>
                  In order to avoid your payments held up in the contract, when
                  you update a gig status to ‘Completed,’ the client would have
                  72 hours to review the submitted work and either close it or
                  logde a dispute. When 72 hours have passed and there is no
                  update from the client, you will be able to come to our
                  platform and lodge a dispute which initiates an audit process
                  and upon completion of the audit you will paid as per the
                  audit terms enumerated below.
                </p>

                <h4 className="mt-2 text-lg font-bold">
                  Payments and Audit Terms
                </h4>
                <p className="font-bold text-red-500 text-lg pt-2">
                  All payments will be done only in tokens accepted by the
                  platform.
                </p>
                <p>There are two payment types under this terms of service:</p>

                <p>
                  <strong>1. Payment Without Audit</strong>
                </p>
                <p>
                  This payment type takes effect if the client confirms their
                  satisfaction without dispute. The gig is completed and
                  verified, and the smart contract releases the payment to you
                  and makes refunds to the client from the platform fees, the
                  refunds is for the fees paid for the audit service which was
                  not activated.
                </p>
                <p>
                  The <strong>payment amount</strong> is the amount that you
                  receive for a gig, which is <strong>95%</strong> of the
                  project fee minus a<strong>5%</strong> fee that we charge for
                  our platform. The refund is the amount that the client
                  receives back which is <strong>10%</strong> from the already
                  paid additional <strong>12%</strong> platform fee.
                </p>
                <p>
                  <strong>2. Payment After Audit</strong>
                </p>
                <p>
                  This payment type takes effect when the you or the client
                  requests for an audit. The gig contract terms and your
                  completed work are sent to an auditor who audits the work done
                  and once verified, the smart contract releases the payment
                  amount and any refunds according to the audit results.
                </p>
                <p>
                  The audit results are the score or the rating, and/or the
                  recommendation that the auditor provides for the work or
                  services that you deliver. The audit results are interpreted
                  to a percentage value, the determined percentage value becomes
                  the payment you are entitled to.{" "}
                  <span className="font-bold text-red-500 text-lg pt-2">
                    As a percentage, the smart contract will only pay you that
                    percent of the payment amount and if there is any excess,
                    this will be refunded to the client.{" "}
                  </span>
                </p>
                <p>
                  For example, if a you or a client requests an audit, the gig
                  is sent to an auditor who under this example, grades the work
                  and judges that is 70% completed based on the requirements and
                  specifications you and the client agreed before the gig
                  started, you will only be paid 70% of the payment amount, the
                  remaining 30% will be refunded to the client.
                </p>
                <p className="font-bold text-red-500 text-lg pt-2">
                  You agree to accept the payment amount depending on which type
                  takes effect, as your sole compensation for the gig. You also
                  agree to pay any taxes or fees that may apply to the payment,
                  the refund, or the platform fee.
                </p>
                <h4 className="font-bold text-lg mt-2">
                  Talent Management and Rating
                </h4>
                <p>
                  In future, our platform will provide a talent management
                  service that helps you improve your skills, performance, and
                  reputation. The talent management service should includes
                  features like:
                </p>
                <ul>
                  <li>
                    <p>
                      <strong>Profile and portfolio:</strong> You can create and
                      edit your profile and portfolio on our platform, and
                      showcase your skills, experience, and testimonials to
                      potential clients or freelancers.
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>Feedback and rating:</strong> You can provide and
                      receive feedback and rating on our platform, and improve
                      your reputation and performance based on the feedback and
                      rating that you receive.
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>Audit and review:</strong> You can request and
                      perform an audit on our platform, and improve your quality
                      and outcome based on the audit and review that you
                      receive.
                    </p>
                  </li>
                </ul>
                <p>
                  You agree to use our talent management service in a
                  professional and ethical manner, and to respect the feedback,
                  rating, audit, and review that you provide or receive on our
                  platform. You also agree not to manipulate, falsify, or
                  misrepresent the feedback, rating, audit, or review that you
                  provide or receive on our platform.
                </p>
                <h4 className="font-bold text-lg mt-2">
                  Rights and Responsibilities
                </h4>
                <p>
                  You retain all rights, title, and interest in and to the work
                  or services that you provide on our platform, subject to the
                  terms and conditions of this terms of service, the contract
                  and the smart contract. You grant us a non-exclusive,
                  royalty-free, worldwide, perpetual, irrevocable, and
                  sublicensable license to use, reproduce, modify, distribute,
                  display, and perform the work or services that you provide on
                  our platform for the purposes of providing, improving, and
                  promoting our platform.
                </p>
                <p>
                  You are solely responsible for the work or services that you
                  provide on our platform, and for any claims, damages, or
                  liabilities that may arise from them. You agree to comply with
                  all applicable laws, regulations, and standards in relation to
                  the work or services that you provide on our platform. You
                  also agree to respect the rights and interests of the client,
                  and any third parties that may be involved or affected by the
                  work or services that you provide on our platform.
                </p>
                <p className="font-bold text-red-500 text-lg pt-2">
                  You agree not to provide any work or services that are
                  illegal, fraudulent, deceptive, abusive, harassing,
                  threatening, defamatory, obscene, offensive, or otherwise
                  objectionable on our platform. You also agree not to provide
                  any work or services that infringe or violate the intellectual
                  property rights, privacy rights, or any other rights of the
                  client or any third parties on our platform.
                </p>
                <h4 className="font-bold text-lg mt-2">
                  Limitation of Liability
                </h4>
                <p>
                  To the maximum extent permitted by law, we are not liable for
                  any direct, indirect, incidental, special, consequential, or
                  exemplary damages or losses that may result from the use of
                  our platform or the work or services provided by freelancers
                  or clients on our platform, including but not limited to loss
                  of profits, revenue, data, goodwill, or reputation.
                </p>
                <p>
                  Our total liability for any claim or dispute arising from the
                  use of our platform or the work or services provided by
                  freelancers or clients on our platform is limited to the
                  amount of fees that we have received from you in relation to
                  the gig that is the subject of the claim or dispute.
                </p>
                <h4 className="font-bold text-lg mt-2">Dispute Resolution</h4>
                <p>
                  If you have any dispute or issue with the client or any third
                  parties in relation to the work or services that you provide
                  on our platform, you agree to first try to resolve it amicably
                  by communicating and cooperating with them.
                </p>
                <p>
                  If you are unable to resolve the dispute or issue amicably,
                  you agree to use the audit feature that we provide on our
                  platform to request or perform an audit for the project. The
                  audit feature allows you to resolve the dispute or issue by an
                  independent and impartial review of the quality and outcome of
                  the gig.
                </p>
                <p>
                  If you are still unsatisfied with the audit results, you agree
                  to submit the dispute or issue to binding arbitration governed
                  by the Arbitration and Conciliation Act of the Federal
                  Republic of Nigeria and particularly the relevant and
                  applicable laws of Lagos State. The arbitration will be
                  conducted in accordance with the rules and procedures of the
                  arbitration institution, and the arbitration award will be
                  final and enforceable by any court of competent jurisdiction
                  in Nigeria.
                </p>
                <p className="font-bold text-red-500 text-lg pt-2">
                  You agree not to initiate or participate in any class action,
                  collective action, or representative action against us or any
                  freelancers or clients on our platform, and to waive any right
                  to do so.
                </p>
                <h4 className="font-bold text-lg mt-2">Governing Law</h4>
                <p>
                  These terms of service are governed by and construed in
                  accordance with the laws of the Federal Republic of Nigeria
                  (where we are located), without regard to its conflict of law
                  principles. You agree to submit to the exclusive jurisdiction
                  of the courts of the country where we are located for any
                  legal action or proceeding arising from or related to these
                  terms of service.
                </p>
                <h4 className="font-bold text-lg mt-2">Changes and Updates</h4>
                <p>
                  We may change or update these terms of service at any time and
                  for any reason, by posting the revised version on our
                  platform. The revised version will take effect immediately
                  upon posting, unless otherwise stated. Your continued use of
                  our platform after the revised version takes effect will
                  constitute your acceptance of the changes or updates. We
                  encourage you to review these terms of service periodically to
                  stay informed of any changes or updates.
                </p>
                <h4 className="font-bold text-lg mt-2">Contact Us</h4>
                <p>
                  If you have any questions, comments, or feedback about these
                  terms of service, please contact us at
                  <span className="text-blue-500">
                    <u>
                      <a href="mailto:info@gigsecured.com" target="_blank">
                        info@gigsecured.com
                      </a>
                    </u>
                  </span>
                  or on twitter(X) at
                  <span className="text-blue-500">
                    <u>
                      <a href="http://www.x.com/gig_secured">@gig_secured</a>
                    </u>
                  </span>
                  or visit our website
                  <span className="text-blue-500">
                    <u>
                      <a href="http://www.gigsecured.com/">here</a>
                    </u>
                  </span>
                  .
                </p>
              </div>


              <p className="py-4">These are the terms and conditions</p>
              <div className="grid space-y-2 w-full">
                <div className="flex gap-3 items-center">
                  <input
                    {...register("terms")}
                    type="checkbox"
                    className="input input-bordered w-8 h-8 border-[#696969] max-w-full bg-white"
                  />
                  <label className="w-full">Accept Terms and Conditions</label>
                </div>
              </div>
              <div className='flex items-center justify-end w-full gap-4'>
                <div className="modal-action" onClick={() => setTermModal(false)}>
                  <label
                    htmlFor="my_modal_6"
                    className="btn btn-error text-white"
                  >
                    Close!
                  </label>
                </div>
                <div className="modal-action" onClick={() => signContract()}>
                  <label
                    htmlFor="my_modal_6"
                    className="border w-full h-10 btn bg-[#D2E9FF] hover:bg-[#76bbff] text-black border-[#D2E9FF"
                  >
                    Sign Contract
                  </label>
                </div>

              </div>
            </div>

          </div>
        </div>
      }
    </div>
  );
}
