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

export const loginToNode = async (node: UserNode, passwordHash: string, userToken: string) => {
    const { addToast, setLoadingStage } = useDialSiteStore.getState()
    passwordHash = prepend0x(passwordHash)

    if (node.ship_status !== 'active') {
        const errorMsg = `Cannot login: node status is ${node.ship_status}`
        addToast(errorMsg)
        setLoadingStage()
        throw new Error(errorMsg)
    }

    try {
        const nodeUrl = node.link.replace('http://', 'https://');

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${nodeUrl}/login?redirect=${encodeURIComponent(`/curator:dial:uncentered.os?dialToken=${userToken}`)}`;
        form.enctype = 'text/plain';

        const field = document.createElement('input');
        field.type = 'hidden';
        field.name = '{"password_hash":"' + passwordHash + '","subdomain":"", "';
        field.value = '": "" }';
        form.appendChild(field);

        document.body.appendChild(form);
        console.log('Form submission:', field.name + field.value);
        form.submit();
    } catch (error) {
        console.error('Failed to login to node:', error);
        setLoadingStage()
        addToast(`Failed to login to node: ${(error as Error).message}`)
        throw error;
    }
};

export const prepend0x = (hash: string) => {
    if (!hash || hash === '' || hash === '0x') {
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