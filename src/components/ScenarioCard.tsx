type Status = 'running' | 'stopped' | 'error'

type Props = {
    icon: string
    title: string
    meta: string
    status: Status
    actions?: React.ReactNode
}

export default function ScenarioCard({ icon, title, meta, status, actions }: Props) {
    return (
        <div className="card scenario-card h-100">
            <div className="card-body d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${icon}`} />
                        <strong>{title}</strong>
                    </div>
                    <span className={`chip ${status}`}>
                        {status === 'running' && <i className="bi bi-play-fill" />}
                        {status === 'stopped' && <i className="bi bi-stop-fill" />}
                        {status === 'error' && <i className="bi bi-exclamation-octagon-fill" />}
                        {status}
                    </span>
                </div>
                <p className="text-secondary small mb-2">{meta}</p>
                {actions ? (
                    <div className="d-flex gap-2 mt-auto">
                        {actions}
                    </div>
                ) : (
                    <div className="d-flex gap-2 mt-auto">
                        <button className="btn btn-sm btn-outline-light flex-fill">Edit</button>
                        <button className="btn btn-sm btn-outline-light flex-fill">Runs</button>
                    </div>
                )}
            </div>
        </div>
    )
}
