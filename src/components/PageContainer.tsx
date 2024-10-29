import classNames from 'classnames'

export default function PageContainer({
    children,
    className,
    ...props
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={classNames(
                'flex flex-col items-center h-screen w-screen relative',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}
