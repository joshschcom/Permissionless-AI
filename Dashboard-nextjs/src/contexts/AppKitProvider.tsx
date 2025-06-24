'use client'

import { wagmiAdapter, projectId } from '@/config/wallet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { bscTestnet } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'Peridot Dashboard',
  description: 'BSC DeFi Dashboard powered by Peridot',
  url: 'https://peridot.app', // Replace with your actual domain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bscTestnet],
  defaultNetwork: bscTestnet,
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function AppKitProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default AppKitProvider 