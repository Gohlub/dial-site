import { UserNode } from '../types/UserNode'
import useDialSiteStore from '../store/dialSiteStore'

export async function deriveNodePassword(
    userId: string,
    serviceType: 'x' | 'siwe' | 'email',
) {
    // For email users, return null to indicate using their login password
    if (serviceType === 'email') {
        return null;
    }

    try {
        const response = await fetch('/api/derive-node-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                serviceType,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to derive password');
        }

        const { password } = await response.json();
        return password;
    } catch (error) {
        console.error('Error deriving node password:', error);
        throw error;
    }
}

export const loginToNode = async (node: UserNode, passwordHash: string) => {
    const { addToast, setLoadingStage, getTokenViaLoginMode } = useDialSiteStore.getState()
    const dialToken = getTokenViaLoginMode()
    passwordHash = prepend0x(passwordHash)

    if (node.ship_status !== 'active') {
        const errorMsg = `Cannot login: node status is ${node.ship_status}`
        addToast(errorMsg)
        setLoadingStage()
        throw new Error(errorMsg)
    }

    try {
        const response = await fetch('/api/node-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                nodeUrl: node.link,
                passwordHash,
                subdomain: node.kinode_name,
                redirect: `/curator:dial:uncentered.os?dialToken=${dialToken}`
            })
        });

        if (response.status >= 400) {
            setLoadingStage()
            throw new Error('Login failed');
        }

        const data = await response.json();

        if (data.redirectUrl) {
            try {
                const cookieString = data.headers['set-cookie'];
                const targetDomain = new URL(data.redirectUrl).hostname;
                const rootDomain = targetDomain.split('.').slice(-3).join('.');  // Gets 'staging.uncentered.systems'

                // Handle the cookie with @ symbol
                const mainCookie = cookieString.split(';')[0];  // Get the main cookie part
                const [cookieName, cookieValue] = mainCookie.split('=');

                // Set both cookie variants with both domain levels
                const cookieConfigs = [
                    { name: cookieName, domain: targetDomain },
                    { name: cookieName, domain: rootDomain },
                    { name: `kinode-auth_${node.kinode_name}`, domain: targetDomain },
                    { name: `kinode-auth_${node.kinode_name}`, domain: rootDomain }
                ];

                cookieConfigs.forEach(({ name, domain }) => {
                    const cookieStr = `${name}=${cookieValue}; path=/; secure; SameSite=None; domain=.${domain}; max-age=86400`;
                    console.log('Setting cookie for domain:', domain, cookieStr);
                    document.cookie = cookieStr;
                });

                // Add a small delay before redirect
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log('Final cookies:', document.cookie);
                window.location.href = data.redirectUrl;
            } catch (error) {
                console.error('Navigation failed:', error);
                setLoadingStage()
                addToast('Failed to access node');
                throw error;
            }
        }
    } catch (error) {
        console.error('Failed to login to node:', error);
        setLoadingStage()
        addToast(`Failed to login to node: ${(error as Error).message}`)
        throw error;
    }
};

export const prepend0x = (hash: string) => {
    if (!hash || hash === '') {
        throw new Error('Hash is required')
    }
    return hash.startsWith('0x') ? hash : `0x${hash}`
}

export const doesNodeHaveDialInstalled = async (node: UserNode) => {
    if (!node.kinode_password) {
        const nodeDetails = await useDialSiteStore.getState().getNodeDetails(node.id)
        node.kinode_password = nodeDetails?.kinode_password
    }
    const password = prepend0x(node.kinode_password || '')
    const response = await fetch(`/api/dial-installed`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: password,
            nodeUrl: node.link
        })
    })
    return response.status === 200
}