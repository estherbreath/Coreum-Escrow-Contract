"use client"
import React, { createContext, useContext, useState } from 'react'


const AppContext = createContext();

function AppProvider({ children }) {
  const [wallet, setWallet] = useState({})
  const [provider, setProvider] = useState({})
  const [errMessage, setErrMessage] = useState('')
  const [sidebar, setSideBar] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [factoryContract, setFactoryContract] = useState({});
  const [gigSecuredAddress, setGigSecuredAddress] = useState("");
  const [auditorsContract, setAuditorsContract] = useState("");

  return (
    <AppContext.Provider value={{ wallet, setWallet, setProvider, provider, errMessage, setErrMessage, auditorsContract, setAuditorsContract, isLoading, setIsLoading, isConnected, setIsConnected, factoryContract, setFactoryContract, gigSecuredAddress, setGigSecuredAddress, sidebar, setSideBar }}>{children}</AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
