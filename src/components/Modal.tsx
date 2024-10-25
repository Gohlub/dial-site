import { FaX } from "react-icons/fa6"
import { useIsMobile } from "../utilities/dimensions"
import classNames from "classnames"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  onClose: () => void
}

export const Modal: React.FC<Props> = ({ title, onClose, children }) => {
  const isMobile = useIsMobile()
  return (
    <div className="flex fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 place-items-center place-content-center backdrop-blur-md">
      <div className={classNames("flex flex-col rounded-lg bg-black py-4 shadow-lg gap-2", {
        'min-w-[500px] px-8 max-w-3/4': !isMobile,
        'px-4 w-full': isMobile
      })}>
        <div className="flex">
          <h1 className="grow">{title}</h1>
          <button
            className="icon self-start"
            onClick={onClose}
          >
            <FaX />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}