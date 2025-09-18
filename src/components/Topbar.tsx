import { useNavigate } from 'react-router-dom'

type Props = { onHamburger: () => void };

export default function Topbar({ onHamburger }: Props) {
    const navigate = useNavigate()
    return (
        <header className="topbar">
            <div className="d-flex align-items-center gap-2">
                {/* mobile hamburger */}
                <button
                    className="btn btn-outline-dark btn-sm btn-sidebar d-lg-none"
                    onClick={onHamburger}
                    aria-label="Open sidebar"
                >
                    <i className="bi bi-list" />
                </button>
            </div>

            <div className="d-flex align-items-center gap-2">
                {/* Upgrade button (replaces New Scenario) */}
                <a className="btn btn-upgrade" href="/billing" role="button">
                    <i className="bi bi-stars me-2" />
                    Upgrade
                </a>

                {/* (optional) Help button – keep if you like */}
                <button className="btn btn-outline-dark btn-sm">
                    <i className="bi bi-question-circle me-1" />
                    Help
                </button>

                {/* User menu */}
                <div className="dropdown">
                    <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                        <i className="bi bi-person-circle me-1" />
                        Benny
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li><a className="dropdown-item" href="#">Profile</a></li>
                        <li><a className="dropdown-item" href="#">API Tokens</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item" onClick={() => navigate('/login')}>Sign out</button></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
