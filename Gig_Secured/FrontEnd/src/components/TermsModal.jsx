import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export const TermsModal = ({ setShowModal }) => {
  return (
    <Transition
      appear
      show={true}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setShowModal(false)}
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
                    <span className='orbitron_font text-[20px] font-normal text-[#000]'>Overdraft Terms & Condition</span>
                  </div>
                </Dialog.Title>
                <div className="my-8">
                  <ul className="list-disc">
                    <li className="pb-4 text-base grotesk_font">
                      To be eligible for an Overdraft, you must be an active user of the Savings Club
                    </li>
                    <li className="pb-4 text-base grotesk_font">
                      Only 20% of the Funds in any of your Savings Club account can be available for an Overdraft
                    </li>
                    <li className="pb-4 text-base grotesk_font">
                      You can repay directly from your basic account, Overdraft will be debited automatically from your savings Club account upon failure to repay
                    </li>
                    <li className="text-base grotesk_font">
                      Interest rate is 5%
                    </li>
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}