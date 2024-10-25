import classNames from "classnames";

export default function Chip({ text, className, ...props }: { text: string, className?: string }) {
    return <div
        className={classNames("bg-white/20 rounded-full px-2 py-1", className)}
        {...props}
    >
        {text}
    </div>
}