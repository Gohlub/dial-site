import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDialSiteStore from '../store/dialSiteStore';

export function SignOut() {
    const navigate = useNavigate();
    const { onSignOut } = useDialSiteStore();

    useEffect(() => {
        onSignOut();
        navigate('/auth');
    }, [navigate]);

    return null;
} 