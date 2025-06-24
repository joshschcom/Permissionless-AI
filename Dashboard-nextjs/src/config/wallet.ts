import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bscTestnet } from '@reown/appkit/networks'

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined')
}

// Configure BSC testnet
export const networks = [bscTestnet]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig 