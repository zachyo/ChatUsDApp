import { http } from 'wagmi'
import { liskSepolia, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const config = getDefaultConfig({
  appName: 'My ChatDApp',
  projectId: projectId || '83f1c68744bb3b7b436f59a454c4c2c5',
  chains: [liskSepolia, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});