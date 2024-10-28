import { FaCircleNotch } from "react-icons/fa";
import useDialSiteStore from "../store/dialSiteStore";
import { NODE_LOADING_STAGES } from "../types/NodeLoadingStages";

export default function StagedLoadingOverlay() {
    const { loadingStage } = useDialSiteStore()
    const loadingStageIndex = Object.keys(NODE_LOADING_STAGES).sort().indexOf(loadingStage)
    return <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col place-items-center place-content-center gap-8'>
        <FaCircleNotch className='animate-spin text-4xl' />
        <div className='text-white text-4xl'>{NODE_LOADING_STAGES[loadingStage as keyof typeof NODE_LOADING_STAGES] || "Loading..."}</div>
        <div className='w-3/4 h-4 bg-gray-200 rounded-full'>
            <div
                className='h-full bg-blue-500 rounded-full'
                style={{ width: `${loadingStage === 'kinode' ?
                    '100%'
                : `${(loadingStageIndex / (Object.keys(NODE_LOADING_STAGES).length - 1)) * 100}%`}` }}
            ></div>
        </div>
    </div>
}