import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Auth from "@/app/auth/Auth";
import { coins } from '@/utils';
import Image from 'next/image';


export const Modal = ({ sending, txnId, amount, setShowModal, Fund }) => {
  let [isOpen, setIsOpen,] = useState(true)
  const { childAddress } = Auth();

  return (
    <Transition
      appear
      show={true}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => (null)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white py-12 px-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  <div className='flex items-center justify-between'>
                    <span className='orbitron_font text-[28px] font-semibold text-[#0F4880]'>SpendNest</span>
                    <div className='items-center flex justify-center'>
                      {coins.map((coin, i) => (
                        <div key={i} className='w-9 h-9 p-1'>
                          <Image
                            src={coin}
                            alt={"coin"}
                            className="object-cover w-full"
                            width={20}
                            height={20}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Title>
                <div className="my-24">
                  <p className="flex items-center gap-1 justify-center">
                    <span className='text-[24px]'>$</span>
                    <span className='text-[40px]'>{amount}</span>
                  </p>

                  <div className='grotesk_font text-[17px] mt-20'>
                    <div className='flex items-center justify-between mb-4'>
                      <span>Wallet Address:</span>
                      <span>{childAddress}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold'>Transaction ID:</span>
                      <span>74920028473663820-2028738</span>
                    </div>
                  </div>
                </div>

                <div className='flex gap-2'>
                  <button onClick={() => setShowModal(false)} className='px-4 grotesk_font h-fit w-full py-3 rounded-xl block text-center text-[white] bg-[red]'>
                    Cancel
                  </button>
                  <button onClick={() => { Fund() }} disabled={sending} className='px-4 grotesk_font h-fit w-full py-3 rounded-xl block text-center text-[white] bg-[#0F4880]'>
                    {!sending ? "Fund Account" : "Funding"}
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

  )
}