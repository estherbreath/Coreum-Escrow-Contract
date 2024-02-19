import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { PiArrowLeftBold } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import Auth from '@/app/auth/Auth';
import childAbi from '@/app/auth/abi/child.json'
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { factoryAddress, usdc } from '@/app/auth/contractAddress';
import factoryAbi from '@/app/auth/abi/factory.json'
import usdcAbi from '@/app/auth/abi/usdc.json'
import axios from 'axios'

// const client = create('https://ipfs.infura.io:5001/api/v0')

export default function CreateContract() {
  const { address } = useAccount();
  const { providerWrite, providerRead } = Auth();
  const router = useRouter();
  const [fileUrl, updateFileUrl] = useState('');
  const [newFile, updateNewFile] = useState();
  const [ipfsLoading, setIpfsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [twelvePercent, setTwelvePercent] = useState(0);
  const [price, setPrice] = useState(0);
  const [termModal, setTermModal] = useState(false);
  const [hasOpenTermModal, setHasOpenTermModal] = useState(false);
  const schema = yup
    .object({
      email: yup.string().email().required(),
      freelancerEmail: yup.string().email().required(),
      title: yup.string().required(),
      category: yup.string().required(),
      // description: yup.string().required(),
      freelancer: yup.string().required(),
      terms: yup
        .bool()
        .oneOf([true], "You need to accept the terms and conditions"),
    })
    .required();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const openTermsModal = () => {
    setHasOpenTermModal(true);
    setTermModal(true);
  };

  const calculateTwelve = (value) => {
    setPrice(value)
    const num = value * 0.12;
    setTwelvePercent(num);
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
        updateFileUrl(`ipfs://${response.data.IpfsHash}/`)
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


  const onSubmit = async (data) => {
    if (!hasOpenTermModal) {
      toast.error("Please read the terms and conditions thoroughly");
      return;
    }
    if (fileUrl === '') {
      toast.error("Please upload a document detailing the project outlines, aims and objectives");
      return;
    }
    const sum = Number(price) + Number(twelvePercent)
    const account = await ethereum.request({ method: 'eth_accounts' });
    const contractRead = new ethers.Contract(factoryAddress, factoryAbi, providerRead);

    const signer = await providerWrite.getSigner(account[0]);

    let gigRegister = await contractRead.getCreatorSystem(address);
    if (gigRegister === "0x0000000000000000000000000000000000000000") {
      toast.success("Create a Register to add secured contracts");
      return;
    } else {
      const contractWrite = new ethers.Contract(gigRegister, childAbi, signer);
      const usdtWrite = new ethers.Contract(usdc, usdcAbi, signer);
      const deadlineFormat = Math.floor(
        new Date(data.deadline).getTime() / 1000
      );

      try {
        setSubmitLoading(true)
        // const estimatedGas = await contractWrite.addGig.estimateGas(data.title, data.category, data.email, data.description, deadlineFormat, ethers.parseUnits(String(sum), 6), data.freelancer);
        await usdtWrite.approve(gigRegister, ethers.parseUnits(String(sum), 6));
        let tx = await contractWrite.addGig(data.title, data.category, data.email, data.freelancerEmail, fileUrl, deadlineFormat, ethers.parseUnits(String(sum), 6), data.freelancer);

        tx.wait().then(async (receipt) => {
          if (receipt && receipt.status == 1) {
            // transaction success.
            setSubmitLoading(false);
            toast.success("Secured Contract created successfully");
            router.push("/contracts");
          }
        });
      } catch (e) {
        if (e.data && contractWrite) {
          const decodedError = contractWrite.interface.parseError(e.data);
          toast.error(`Transaction failed: ${decodedError?.name}`);
        } else {
          console.log(`Error in contract:`, e);
        }
        setSubmitLoading(false);
      }
    }
  };

  return (
    <div className="w-full text-black">
      <form className="pt-20 pb-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-4">
          <PiArrowLeftBold
            size={28}
            className="font-bold cursor-pointer text-4xl mt-2"
            onClick={() => router.back()}
          />
          <div
            className={`bg-[#D9D9D9] personal_savings_card p-6 flex flex-col gap-4 justify-between w-full cursor-pointer `}
          >
            <span className="text-[20px] tracking-[0.085px] leading-5">
              Create a Gig Secured Contract
            </span>
            <span className="grotesk_font text-base tracking-[0.085px] leading-5">
              Use this form to create a secured contract between you and a
              freelancer
            </span>
          </div>
        </div>

        {/* form */}
        <div className="my-12">
          <div className="grid lg:flex gap-5 w-full mb-5">
            <div className="grid space-y-2 w-full">
              <label>Title</label>
              <input
                {...register("title")}
                type="text"
                placeholder="Contract Title"
                className="input input-bordered  border-[#696969] w-full max-w-full bg-white"
              />
              <p className="text-field-error italic text-red-500">
                {errors.title?.message}
              </p>
            </div>
            <div className="grid space-y-2 w-full">
              <label>Your Email</label>
              <input
                {...register("email")}
                type="text"
                placeholder="Please Enter Your Valid Email"
                className="input input-bordered  border-[#696969] w-full max-w-full bg-white"
              />
              <p className="text-field-error italic text-red-500">
                {errors.email?.message}
              </p>
            </div>
          </div>
          <div className="grid lg:flex gap-5 w-full mb-5">
            <div className="grid space-y-2 w-full">
              <label>Deadline</label>
              <input
                {...register("deadline")}
                type="date"
                className="input input-bordered  border-[#696969] w-full max-w-full bg-white"
              />
              <p className="text-field-error italic text-red-500">
                {errors.deadline?.message}
              </p>
            </div>
            <div className="grid space-y-2 w-full">
              <label>Category</label>
              <select
                {...register("category")}
                className="select select-bordered border-[#696969] w-full max-w-full bg-white"
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
              <p className="text-field-error italic text-red-500">
                {errors.category?.message}
              </p>
            </div>
          </div>
          <div className="grid lg:flex gap-5 w-full mb-5">
            <div className="block space-y-2 w-full">
              <label>Freelancer Wallet Address</label>
              <input
                {...register("freelancer")}
                type="text"
                placeholder="Please add a Valid Freelancer Wallet Address"
                className="input input-bordered  border-[#696969] w-full max-w-full bg-white"
              />
              <p className="text-field-error italic text-red-500">
                {errors.freelancer?.message}
              </p>
            </div>
            <div className="grid space-y-2 w-full">
              <div className='grid gap-2'>
                <label>
                  Price + 12% for possible audit and platform fees
                </label>
                <div className='grid gap-2 md:flex'>
                  <input
                    // {...register("price")}
                    type="number"
                    value={price}
                    onChange={(e) => calculateTwelve(e.target.value)}
                    min={1}
                    placeholder="Please add a contract Fee"
                    className="input input-bordered md:w-[80%] appearance-none border-[#696969] max-w-full bg-white"
                  />
                  <input
                    type="number"
                    disabled
                    value={twelvePercent}
                    placeholder="12% stake"
                    className="input input-bordered md:w-[20%] disabled:bg-white disabled:text-black border-[#696969] max-w-full bg-white"
                  />
                </div>

              </div>
              <p className="text-field-error italic text-red-500">
                {errors.price?.message}
              </p>
            </div>
          </div>
          <div className="grid lg:flex gap-5 w-full mb-2">
            <div className="grid space-y-2 w-full">
              <label>Freelancer Email</label>
              <input
                {...register("freelancerEmail")}
                type="text"
                placeholder="Please Enter Your Valid Email"
                className="input input-bordered  border-[#696969] w-full max-w-full bg-white"
              />
              <p className="text-field-error italic text-red-500">
                {errors.freelancerEmail?.message}
              </p>
            </div>
            <div className="w-full space-y-2">
              <label>Project Documentation (IPFS)</label>
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
              {/* <input
                {...register("description")}
                type="text"
                placeholder="Please Enter Your Project Document Link"
                className="input input-bordered  border-[#696969] w-full max-w-full bg-white"
              /> */}
              {(fileUrl === '' && errors.description?.message) &&
                <p className="text-field-error italic text-red-500">
                  Please upload your document
                </p>
              }
            </div>
          </div>
          {fileUrl !== "" &&
            <div className="grid space-y-2 w-full">
              <label>Uploaded Document Link</label>
              <input
                value={fileUrl}
                disabled
                type="text"
                className="input input-bordered text-black  border-[#696969] w-full max-w-full bg-white disabled:bg-white"
              />
            </div>
          }
          <div className="grid space-y-2 pt-4 w-full">
            <button
              type="button"
              onClick={() => openTermsModal()}
              className="w-full h-[58px] rounded-lg underline text-[#3997b9] text-[17px] block mx-auto leading-[25.5px] tracking-[0.5%]"
            >
              View Terms and Conditions
            </button>
            <p className="text-field-error italic text-red-500 text-center pt-">
              {errors.terms?.message}
            </p>
          </div>
        </div>

        <button
          disabled={submitLoading || ipfsLoading}
          className={`${(submitLoading || ipfsLoading) && "cursor-not-allowed"} w-[360px] h-[58px] rounded-lg bg-[#2A0FB1] hover:bg-[#684df0] text-[#FEFEFE] text-[17px] block mx-auto leading-[25.5px] tracking-[0.5%]`}
        >
          {submitLoading ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : (
            "Create Secured Contract"
          )}
        </button>
      </form>

      {/* Term and Conditions */}
      {termModal && (
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
                  Terms of Service for Clients on Gig Secured
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
                  relationship with you as a client. By using our platform, you
                  agree to be bound by these terms of service.
                </p>
                <p className="font-bold text-red-500 text-lg pt-2">
                  If you do not agree with these terms of service, please do not
                  use our platform.
                </p>
                <div>
                  <h4 className="mt-2 text-lg font-bold">Definitions</h4>
                  <p>
                    In these terms of service, the following words have the
                    following meanings:
                  </p>
                  <ul className="list-disc py-3 px-4 grid space-y-1">
                    <li>
                      "We", "us", "our" refer to Gig Secured, the owner and
                      operator of the platform.
                    </li>
                    <li>
                      "You", "your" refer to you, the client who uses our
                      platform to hire and manage your relationship with the
                      freelancers working on your projects (gigs).
                    </li>
                    <li>
                      "Platform" refers to our website, onchain, and any other
                      online or offline services that we provide.
                    </li>
                    <li>
                      "Freelancer" refers to any person or entity who uses our
                      platform to manage their relationship with clients who are
                      in need of their services.
                    </li>
                    <li>
                      "Contract" or "Gig" refers to the agreement or arrangement
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
                  manage their projects (gig) relationship using an escrow
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
                <p>To use our platform as a client, you only need to:</p>
                <ul>
                  <li>
                    Create a contract where you wil explicitly state the details
                    of the gig contract you are creatingterms, requirements, and
                    milestones the terms of the contract by your signature.
                  </li>
                  <li>
                    Use a compactible Web 3 wallet client like Base or Metamask
                    wallets and email for verification and signature.
                  </li>
                  <li>Agree to our terms of service and privacy policy.</li>
                </ul>
                <p>
                  You are responsible for maintaining the security and
                  confidentiality of every gig you create. You are also
                  responsible for any activities or actions that occur under
                  your account. You agree to notify us immediately if you have
                  any difficulty accessing a gig you created or if your wallet
                  has been compromised.
                </p>
                <h4 className="mt-2 text-lg font-bold">Gigs</h4>
                <p>
                  You are responsible for meeting your freelancer and agreeing
                  with your freelancer all the terms, requirements and
                  milestones before creating a contract on our platform. Our
                  platform allows you to create a contract based on the terms of
                  your agreement, recieves payment from you as security of
                  guaranteed payment for the freelancer, secures the payment on
                  the blockchain and handles settlement when the contract is
                  finalised.
                </p>
                <p>
                  At the creation point, you will upload a link to a document
                  containing the terms, requirements and milestones of the gig
                  as you agreed with the freelancer, this would come handy if
                  there is a dispute between you and the freelancer.
                </p>
                <p>
                  After creating your contract, you will invite the freelancer
                  you negotiated with to sign the contract and commence your gig
                  based on the terms stated by you. After creating your contract
                  and while its status is <strong>"Pending"</strong>, you will
                  be able to edit the deadline, the title, the description
                  (terms, requirements and milestones). Once the freelancer you
                  appointed signs the contract and moves it from
                  <strong>"Pending"</strong> status to{" "}
                  <strong>"Building,"</strong>you will be unable to make changes
                  to the gig.
                </p>
                <p className="font-bold text-red-500 text-lg pt-2">
                  Do note, that you cannot change the freelancer after creating
                  a contract, in such situation, you will need to force close
                  the contract and create a new one.
                </p>
                <h4 className="mt-2 text-lg font-bold">Deadlines</h4>
                <p>
                  You will define the dealine of your contract before inviting
                  the freelancer to sign. Our platforms handles deadlines in
                  these manner:
                </p>
                <ol className="list-disc py-3 px-4 grid space-y-1">
                  <li>
                    If a freelancer is invited to sign a contract and fails to
                    sign the contract within 72 hours, you will be able to come
                    to the platform and close the contract and get refunded the
                    amount you put up in accordance with these terms of service.
                  </li>
                  <li>
                    If a freelancer accepts a gig from you, signs and fails to
                    complete it within the agreed deadline, the contract will
                    fail and revert, refunds would be made to you who created
                    the contract in accordance with these terms of service.
                  </li>
                </ol>
                <p className="text-red-500 py-1">
                  All these are done to foster accountability and adherence to
                  contractual obligations.
                </p>

                <h4 className="mt-2 text-lg font-bold">
                  Contracts and Smart Contracts
                </h4>
                <p>
                  When you and the freelancer agree on a proposal, a contract is
                  formed between you and them on our platform for the project.
                  The contract specifies the terms, requirements, and milestones
                  of the project.
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
                  You agree to abide by these terms and conditions, the contract
                  and the smart contract, and to pay the freelancer according to
                  the agreed milestones and deliverables.
                </p>

                <h4 className="mt-2 text-lg font-bold">
                  Escrow, Payment and Audits
                </h4>
                <p>
                  When a contract is formed, you are required to deposit the
                  project fee plus an additional <strong>12%</strong> for the
                  possible audit service as part of the platform fees. The
                  project fee is the amount that you agree to pay the freelancer
                  for the project. The audit service is the service that we
                  provide on our platform that allows you or the freelancer to
                  request for an audit for a completed gig.
                </p>
                <p>
                  We hold the project and platform fees in escrow on our
                  platform through the smart contract until the project is
                  completed, verified and closed. The escrow is a service that
                  we provide on our platform that holds and releases the funds
                  for the project according to the smart contract.
                </p>
                <p>
                  When the freelancer delivers the work or services according to
                  the agreed milestones and deliverables, they need to request
                  payment from you on our platform. When you review the work or
                  services that the freelancer delivers, you need to confirm
                  your satisfaction or request an audit on our platform within
                  72 hours of the client delivering the completed work by
                  updating the status from <strong>"Building"</strong>to
                  <strong>"Completed"</strong>.
                </p>
                <p>
                  The <strong>72</strong> hours timeframe is to avoid
                  significant delay in the payment of a freelancer upon
                  completion of a gig. When the 72 hours have passed, the
                  platform will allow the freelancer to lodge a dispute which
                  will initiate the audit process and upon completion of the
                  audit the freelancer will be paid as per the audit terms
                  enumerated below.
                </p>
                <h5 className="mt-2 text-lg font-bold">
                  - Payments and Audit Terms
                </h5>
                <p>
                  All payments will be done only in tokens accepted by the
                  platform. There are two payment types under this terms of
                  service:
                </p>
                <p>
                  <strong>1. Payment Without Audit</strong>
                </p>
                <p>
                  This payment type takes effect if the you confirm your
                  satisfaction with what the freelancer delivered without
                  dispute. The gig is completed and verified, and the smart
                  contract releases the payment to the freelancer and makes
                  refunds to you from the platform fees, the refunds is for the
                  fees paid for the audit service which was not activated.
                </p>
                <p>
                  The <strong>payment amount</strong> is the amount that the
                  client will receive for a gig, which is <strong>95%</strong>{" "}
                  of the project fee minus a <strong>5%</strong> fee that we
                  charge the freelancer as our platform fees. The refund is the
                  amount that you receive back which is <strong>10%</strong>{" "}
                  from the already paid additional <strong>12%</strong> platform
                  fee, the remaining <strong>2%</strong> is retained by us as
                  platform fees.
                </p>
                <p>
                  <strong>2. Payment After Audit</strong>
                </p>
                <p>
                  This payment type takes effect when the you or the freelancer
                  requests for an audit. The gig contract terms and the
                  completed work are sent to an auditor who audits the work done
                  and once verified, the smart contract releases the payment
                  amount and any refunds according to the audit results.
                </p>
                <p>
                  The audit results are the score or the rating, and/or the
                  recommendation that the auditor provides for the work or
                  services that the freelancer delivers. The audit results are
                  interpreted to a percentage value, the determined percentage
                  value becomes the payment the freelancer is entitled to. As a
                  percentage, the smart contract will only pay the freelancer
                  that percent of the payment amount and if there is any excess,
                  this will be refunded to you.
                </p>
                <p>
                  For example, if a you or a freelancer requests an audit, the
                  gig is sent to an auditor who under this example, grades the
                  work and judges that is 70% completed based on the
                  requirements and specifications you and the freelancer agreed
                  before the gig started, the freelancer will only be paid 70%
                  of the payment amount, the remaining 30% will be refunded to
                  you.
                </p>
                <p className="font-bold text-red-500 text-lg pt-2">
                  You agree to pay the project fee, the audit fee, and any other
                  fees or charges that may apply to the project. You also agree
                  to accept the payment, the refund, and the audit fee as the
                  final and sole compensation for the project.
                </p>
                <h4 className="mt-2 text-lg font-bold">
                  Talent Management and Rating
                </h4>
                <p>
                  In future, our platform will provide a talent management
                  service that helps you find and hire the best freelancers for
                  your projects. The talent management service should includes
                  features like:
                </p>
                <ul className="list-disc py-3 px-4 grid space-y-1">
                  <li>
                    <strong>Profile and portfolio:</strong> You can view and
                    compare the profiles and portfolios of the freelancers on
                    our platform, and evaluate their skills, experience, and
                    testimonials.
                  </li>
                  <li>
                    <strong>Feedback and rating:</strong> You can provide and
                    receive feedback and rating on our platform, and measure the
                    satisfaction and performance of the freelancers that you
                    hire.
                  </li>
                  <li>
                    <strong>Audit and review:</strong> You can request and
                    perform an audit on our platform, and verify the quality and
                    outcome of the projects that you hire freelancers for.
                  </li>
                </ul>
                <p className="font-bold text-red-500 text-lg pt-2">
                  You agree to use our talent management service in a
                  professional and ethical manner, and to respect the feedback,
                  rating, audit, and review that you provide or receive on our
                  platform. You also agree not to manipulate, falsify, or
                  misrepresent the feedback, rating, audit, or review that you
                  provide or receive on our platform.
                </p>

                <h4 className="mt-2 text-lg font-bold">
                  Rights and Responsibilities
                </h4>
                <p>
                  You retain all rights, title, and interest in and to the work
                  or services that you hire freelancers for on our platform,
                  subject to the terms and conditions of the contract and the
                  smart contract. You grant us a non-exclusive, royalty-free,
                  worldwide, perpetual, irrevocable, and sublicensable license
                  to use, reproduce, modify, distribute, display, and perform
                  the work or services that you hire freelancers for on our
                  platform for the purposes of providing, improving, and
                  promoting our platform.
                </p>
                <p>
                  You are solely responsible for the work or services that you
                  hire freelancers for on our platform, and for any claims,
                  damages, or liabilities that may arise from them. You agree to
                  comply with all applicable laws, regulations, and standards in
                  relation to the work or services that you hire freelancers for
                  on our platform. You also agree to respect the rights and
                  interests of the freelancer and any third parties that may be
                  involved or affected by the work or services that you hire
                  freelancers for on our platform.
                </p>
                <p>
                  You agree not to hire any freelancers for any work or services
                  that are illegal, fraudulent, deceptive, abusive, harassing,
                  threatening, defamatory, obscene, offensive, or otherwise
                  objectionable on our platform. You also agree not to hire any
                  freelancers for any work or services that infringe or violate
                  the intellectual property rights, privacy rights, or any other
                  rights of the freelancer or any third parties on our platform.
                </p>
                <h4 className="mt-2 text-lg font-bold">
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
                  the project that is the subject of the claim or dispute.
                </p>
                <h4 className="mt-2 text-lg font-bold">Dispute Resolution</h4>
                <p>
                  If you have any dispute or issue with the freelancer or any
                  third parties in relation to the work or services that you
                  hire freelancers for on our platform, you agree to first try
                  to resolve it amicably by communicating and cooperating with
                  them.
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
                <h4 className="mt-2 text-lg font-bold">Governing Law</h4>
                <p>
                  These terms of service are governed by and construed in
                  accordance with the laws of the Federal Republic of Nigeria
                  (where we are located), without regard to its conflict of law
                  principles. You agree to submit to the exclusive jurisdiction
                  of the courts of the country where we are located for any
                  legal action or proceeding arising from or related to these
                  terms of service.
                </p>
                <h4 className="mt-2 text-lg font-bold">Changes and Updates</h4>
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
                <h4 className="mt-2 text-lg font-bold">Contact Us</h4>
                <p>
                  If you have any questions, comments, or feedback about these
                  terms of service, please contact us at{" "}
                  <span className="text-blue-500">
                    <u>
                      <a href="mailto:info@gigsecured.com" target="_blank">
                        info@gigsecured.com
                      </a>
                    </u>
                  </span>{" "}
                  or on twitter(X) at{" "}
                  <span className="text-blue-500">
                    <u>
                      <a href="http://www.x.com/gig_secured">@gig_secured</a>
                    </u>
                  </span>{" "}
                  or visit our website{" "}
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
              <div className="modal-action" onClick={() => setTermModal(false)}>
                <label
                  htmlFor="my_modal_6"
                  className="btn btn-error text-white"
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
