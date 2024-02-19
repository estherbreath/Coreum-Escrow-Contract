'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import Context from '@/app/auth/Context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppProvider from '@/app/auth/Context';
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  walletConnectWallet,
  coinbaseWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { baseGoerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const Disclaimer = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{' '}
    <Link href='/terms_conditions'>Terms of Service</Link> and acknowledge you
    have read and understand the platform you are about to use{' '}
    <Link href='https://disclaimer.xyz'>Disclaimer</Link>
  </Text>
);

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [baseGoerli],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

// const projectId = "da13ae5c5a626a6b77401afe1fcfa047";

const { connectors } = getDefaultWallets({
  // appName: 'GigSecured',
  projectId: 'da13ae5c5a626a6b77401afe1fcfa047',
  chains,
  groupName: 'Recommended',
  wallets: [
    injectedWallet({ chains }),
    coinbaseWallet({ appName: 'GigSecured', chains }),
    metaMaskWallet({ projectId: 'da13ae5c5a626a6b77401afe1fcfa047', chains }),
    walletConnectWallet({
      projectId: 'da13ae5c5a626a6b77401afe1fcfa047',
      chains,
    }),
  ],
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Create Next App',
//   description: 'Generated by create next app',
// }

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            modalSize='compact'
            chains={chains}
            appInfo={{
              appName: 'Gig Secured',
              disclaimer: Disclaimer,
            }}
          >
            <ToastContainer
              position="bottom-center"
              autoClose={1500}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme='colored'
            />

            <AppProvider>{children}</AppProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}