interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md'
}: ModalProps) {
    if (!isOpen) return null

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    }

    return (
        <div className="fixed backdrop-blur-sm inset-0 bg-white bg-opacity-20 flex items-center justify-center z-50">
            <div className={`bg-white rounded-lg p-6 w-full shadow-lg ${maxWidthClasses[maxWidth]}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="icon thin"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
} 