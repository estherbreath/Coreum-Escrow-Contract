/** @format */
'use client';
import Auth from '@/app/auth/Auth';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { auditorAddress, factoryAddress } from '@/app/auth/contractAddress';
import auditAbi from '@/app/auth/abi/audit.json';
import factoryAbi from '@/app/auth/abi/factory.json';
import childAbi from '@/app/auth/abi/child.json';
import { SlDocs } from 'react-icons/sl';
import { FiUsers } from 'react-icons/fi';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';

export default function AdminDash() {
  const router = useRouter();

  const { providerRead, providerWrite } = Auth();
  const { address, isConnected } = useAccount();
  const [auditorDetails, setAuditorDetails] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contract');
  const [registersDetails, setRegistersDetails] = useState([]);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [gigsForSelectedRegister, setGigsForSelectedRegister] = useState([]);

  const handleRegisterView = (registerAddress) => {
    setSelectedRegister(registerAddress);
    router.push(`/admin/register/${registerAddress}`);
  };

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
    const getAuditorDetails = async () => {
      setLoadingPage(true);
      try {
        const contract = new ethers.Contract(
          auditorAddress,
          auditAbi,
          providerRead
        );

        const count = await contract.auditorsCount(); // Assuming you have a function to get the count of auditors
        const auditorsArray = [];

        for (let i = 0; i < count; i++) {
          const auditor = await contract.auditors(i);
          auditorsArray.push(auditor);
        }

        console.log(auditorsArray);
        setAuditorDetails(auditorsArray);
        setLoadingPage(false);
      } catch (error) {
        console.error('Error fetching auditor details:', error);
        setLoadingPage(false);
      }
    };

    if (isConnected) {
      getAuditorDetails();
    }
  }, [address]);

  useEffect(() => {
    const getAllRegistersDetails = async () => {
      setLoadingPage(true);
      try {
        const contract = new ethers.Contract(
          factoryAddress,
          factoryAbi,
          providerRead
        );

        const registersArray = await contract.getAllRegisters(); // Assuming this function returns an array of Register objects
        console.log(registersArray);

        // Set the registersArray state
        setRegistersDetails(registersArray);

        setLoadingPage(false);
      } catch (error) {
        console.error('Error fetching register details:', error);
        setLoadingPage(false);
      }
    };

    if (isConnected) {
      getAllRegistersDetails();
    }
  }, [isConnected]);

  const reloadDetails = async () => {
    setLoadingPage(true);
    try {
      const contract = new ethers.Contract(
        auditorAddress,
        auditAbi,
        providerRead
      );

      const count = await contract.auditorsCount(); // Assuming you have a function to get the count of auditors
      const auditorsArray = [];

      for (let i = 0; i < count; i++) {
        const auditor = await contract.auditors(i);
        auditorsArray.push(auditor);
      }

      console.log(auditorsArray);
      setAuditorDetails(auditorsArray);
      setLoadingPage(false);
    } catch (error) {
      console.error('Error fetching auditor details:', error);
      setLoadingPage(false);
    }
  };

  const confirmAuditor = async (auditorAddress) => {
    try {
      // Call the confirmAuditor function from your contract
      const signer = await providerWrite.getSigner();
      const contract = new ethers.Contract(auditorAddress, auditAbi, signer);

      const transaction = await contract.confirmAuditor(auditorAddress);
      await transaction.wait();

      // Reload auditor details after confirmation
      reloadDetails();
    } catch (error) {
      console.error('Error confirming auditor:', error);
      // Handle error as needed
    }
  };

  console.log(auditorDetails);

  const handleTab1Click = () => {
    setActiveTab('contract');
  };

  const handleTab2Click = () => {
    setActiveTab('audit');
  };

  // Function to get all gigs for a specific register

  return (
    <main>
      <section className='mt-20 '>
        {loadingPage ? (
          <div className='text-center h-full'>
            <div role='status'>
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
          </div>
        ) : (
          <div>
            {auditorDetails && auditorDetails.length > 0 && !loadingPage ? (
              <div className='dashboard text-black '>
                <h1 className='text-3xl font-bold mb-8'>Admin Dashboard</h1>
                <div className='flex flex-col justify-center items-center w-full'>
                  <div className='dash-tab w-full flex justify-between items-center gap-4 font-bold text-lg text-[#0F4880]'>
                    <button
                      className={`flex items-center gap-4 tab-button w-full border-2 h-24 rounded-xl text-left px-4 border-[#0F4880] ${
                        activeTab === 'contract'
                          ? 'bg-[#0F4880] text-[#D2E9FF]'
                          : ''
                      }`}
                      onClick={handleTab1Click}
                    >
                      <SlDocs className='text-3xl font-bold' />
                      Contracts
                    </button>
                    <button
                      className={`flex items-center gap-4 tab-button w-full border-2 h-24 rounded-xl text-left px-4 border-[#0F4880] ${
                        activeTab === 'audit'
                          ? 'bg-[#0F4880] text-[#D2E9FF]'
                          : ''
                      }`}
                      onClick={handleTab2Click}
                    >
                      <FiUsers className='text-3xl font-bold' />
                      Auditor
                    </button>
                  </div>
                  <div className='tab-content mt-8 border-2 rounded-xl text-left px-4 py-4 border-[#0F4880] w-full '>
                    {activeTab === 'contract' && (
                      <div className='overflow-x-auto'>
                        <table className='table '>
                          {/* head */}
                          <thead>
                            <tr>
                              <th>S/N</th>
                              <th>Register</th>
                              <th>Creator</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* rows */}
                            {registersDetails.map((register, index) => (
                              <tr key={index + 1}>
                                <th>{index + 1}</th>
                                <td>{register.register}</td>
                                <td>{register.creator}</td>
                                <td>
                                  <Link
                                    href={`/admin/allContracts?register=${register.register}`}
                                    className='border-2 rounded-3xl border-[#0F4880] py-1 px-6'
                                    // onClick={() =>
                                    //   handleRegisterView(register.register)
                                    // }
                                  >
                                    View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {activeTab === 'audit' && (
                      <div className='overflow-x-auto'>
                        <table className='table '>
                          {/* head */}
                          <thead>
                            <tr>
                              <th>S/N</th>
                              <th>Category</th>
                              <th>Address</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>No of Gigs</th>
                              <th>Confirmation Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* rows */}
                            {auditorDetails.map((auditor, index) => (
                              <tr key={index + 1}>
                                <th>{index + 1}</th>
                                <td>{auditor.category}</td>
                                <td>{auditor._auditor}</td>
                                <td>{auditor.email}</td>
                                <td>
                                  {auditor.isConfirmed
                                    ? 'Confirmed'
                                    : 'Not Confirmed'}
                                  {!auditor.isConfirmed && (
                                    <button
                                      className='border-2 rounded-3xl border-[#0F4880] py-1 px-3'
                                      onClick={() =>
                                        confirmAuditor(auditor._auditor)
                                      }
                                    >
                                      Confirm
                                    </button>
                                  )}
                                </td>
                                <td>{Number(auditor.currentGigs)}</td>
                                <td>
                                  {auditor.isConfirmed
                                    ? new Date(
                                        Number(auditor.confirmationTime) * 1000
                                      ).toLocaleString()
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        )}
      </section>
    </main>
  );
}
