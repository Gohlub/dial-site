export const OPTIMISM_CHAIN_ID = '0xA' // hex for 10
// const OPTIMISM_CHAIN_ID = '0x1A4' // hex for 420 (testnet)

export const switchToOptimism = async () => {
    try {
        console.log('switching to optimism')
        // Try to switch to Optimism
        await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: OPTIMISM_CHAIN_ID }],
        })
    } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await (window as any).ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: OPTIMISM_CHAIN_ID,
                        chainName: 'Optimism',
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://mainnet.optimism.io'],
                        blockExplorerUrls: ['https://optimistic.etherscan.io']
                    }]
                })
            } catch (addError) {
                throw addError
            }
        }
        throw switchError
    }
}

