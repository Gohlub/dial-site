import Modal from './common/Modal'

interface ForgotPasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Forgot Password"
        >
            <p>If you've forgotten your password, you can reset it by clicking "Sign Up" and reconfirming your email address.</p>
        </Modal>
    )
}
