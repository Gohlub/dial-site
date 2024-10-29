import { FaCircleNotch } from 'react-icons/fa'
import useDialSiteStore from '../store/dialSiteStore'
import { NODE_LOADING_STAGES } from '../types/nodeLoadingStages'

export default function StagedLoadingOverlay() {
    const { loadingStage, userNodes } = useDialSiteStore()
    if (!loadingStage) return null

    const loadingStageIndex = Object.keys(NODE_LOADING_STAGES)
        .sort()
        .indexOf(loadingStage || '')

    return (
        <div className="fixed top-0 left-0 bg-white/20 w-full h-full flex flex-col place-items-center place-content-center gap-8">
            <div className="flex flex-col place-items-center place-content-center gap-4 bg-white rounded-2xl p-8 shadow-xl">
                <FaCircleNotch className="animate-spin text-4xl" />
                <h1 className="text-4xl">
                    {NODE_LOADING_STAGES[
                        loadingStage as keyof typeof NODE_LOADING_STAGES
                    ] || 'Loading...'}
                </h1>
                <div className="h-4 self-stretch rounded-full border border-solid border-2 border-orange">
                    <div
                        className="h-full bg-orange rounded-full"
                        style={{
                            width: `${loadingStage === 'kinode'
                                ? '100%'
                                : `${(loadingStageIndex / (Object.keys(NODE_LOADING_STAGES).length - 1)) * 100}%`
                                }`,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    )
}
