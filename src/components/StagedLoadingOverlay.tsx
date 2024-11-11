import { FaCircleNotch } from 'react-icons/fa'

export default function StagedLoadingOverlay({
    stages,
    currentStage,
    finalStage,
    emergencyButton,
}: {
    stages: Record<string, string>
    currentStage: string
    finalStage: string
    emergencyButton?: React.ReactNode
}) {
    if (!currentStage) return null

    const currentStageIndex = Object.keys(stages)
        .sort()
        .indexOf(currentStage || '')

    return (
        <div className="fixed top-0 left-0 bg-white/20 w-full h-full flex flex-col place-items-center place-content-center gap-8">
            <div className="flex flex-col place-items-center place-content-center gap-4 bg-white rounded-2xl p-8 shadow-xl">
                <FaCircleNotch className="animate-spin text-4xl" />
                <h1 className="text-4xl">
                    {stages[
                        currentStage as keyof typeof stages
                    ] || 'Loading...'}
                </h1>
                <div className="h-4 self-stretch rounded-full border border-solid border-2 border-orange">
                    <div
                        className="h-full bg-orange rounded-full"
                        style={{
                            width: `${currentStage === finalStage
                                ? '100%'
                                : `${(currentStageIndex / (Object.keys(stages).length - 1)) * 100}%`
                                }`,
                        }}
                    ></div>
                </div>
                {emergencyButton}
            </div>
        </div>
    )
}
