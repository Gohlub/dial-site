import classNames from 'classnames'
import useDialSiteStore from '../store/dialSiteStore'
import dayjs from 'dayjs'
import { useIsMobile } from '../utilities/dimensions'

export const Alerts: React.FC = () => {
    const { alerts, setAlerts } = useDialSiteStore()
    const isMobile = useIsMobile()
    return (
        <div
            className={classNames(
                'fixed flex flex-col place-items-center max-h-48 overflow-y-auto',
                {
                    'top-12 left-2 right-2': !isMobile,
                    'top-0 left-0 right-0': isMobile,
                },
            )}
        >
            {alerts
                .filter(
                    (a, i, alerts) =>
                        !a.dismissed &&
                        alerts.findIndex((b) => b.id === a.id) === i,
                )
                .slice()
                .reverse()
                .map((alert, i) => (
                    <div
                        key={alert.id}
                        className={classNames(
                            'flex gap-2 text-white py-2 px-4 rounded-md mb-2 backdrop-blur-md relative',
                            {
                                'bg-red-500/25':
                                    alert.class === 'danger' ||
                                    alert.class === 'alert',
                                'bg-yellow-500/25 text-black':
                                    alert.class === 'warning',
                                'bg-blue-500/25': alert.class === 'info',
                            },
                        )}
                    >
                        <div
                            className={classNames('flex flex-col gap-2', {
                                'w-7/8': !isMobile,
                            })}
                        >
                            <span className="mr-1">
                                {dayjs(alert.start_time * 1000).format(
                                    'MMMM DD, YYYY h:mm A',
                                )}
                                :
                            </span>
                            <div>{alert.content}</div>
                        </div>
                        <div
                            className={classNames(
                                'flex flex-col gap-2 self-stretch',
                                {
                                    'w-1/8': !isMobile,
                                },
                            )}
                        >
                            <button
                                className="clear grow"
                                onClick={() =>
                                    setAlerts(
                                        alerts.map((a) =>
                                            a.id === alert.id
                                                ? { ...a, dismissed: true }
                                                : a,
                                        ),
                                    )
                                }
                            >
                                Dismiss
                            </button>
                            {i < 1 && (
                                <button
                                    className="clear grow"
                                    onClick={() => setAlerts([])}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                ))}
        </div>
    )
}
