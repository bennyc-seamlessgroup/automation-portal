import { NavLink } from 'react-router-dom'
import clsx from 'classnames'

type Props = { open: boolean; onClose: () => void }

const NAV = [
    { label: 'Dashboard', icon: 'bi-speedometer2', to: '/dashboard' },
    { label: 'Scenarios', icon: 'bi-diagram-3', to: '/scenarios' },
    { label: 'Templates', icon: 'bi-grid', to: '/templates' },
    { label: 'Data Stores', icon: 'bi-database', to: '/data-stores' },
    { label: 'Connections', icon: 'bi-plug', to: '/connections' },
    { label: 'Apps', icon: 'bi-app-indicator', to: '/apps' },
    { label: 'Webhooks', icon: 'bi-link-45deg', to: '/webhooks' },
]
const ORG = [
    { label: 'Teams', icon: 'bi-people', to: '/teams' },
    { label: 'Billing', icon: 'bi-credit-card', to: '/billing' },
    { label: 'Settings', icon: 'bi-gear', to: '/settings' },
]
const SUPPORT = [
    { label: 'Help & Docs', icon: 'bi-life-preserver', to: '/help' },
]

export default function Sidebar({ open, onClose }: Props) {
    return (
        <aside className={clsx('sidebar', { show: open })} onMouseLeave={onClose}>
            <a className="brand" href="#">
                <i className="bi bi-diagram-3" />
                <span>Seamless Automation</span>
            </a>
            <div className="nav-rail">
                <div className="nav-section-title">Main</div>
                {NAV.map(item => (
                    <NavLink key={item.to} to={item.to}
                        className={({ isActive }) => clsx('nav-link', { active: isActive })}>
                        <i className={`bi ${item.icon}`} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <div className="nav-section-title">Organization</div>
                {ORG.map(item => (
                    <NavLink key={item.to} to={item.to}
                        className={({ isActive }) => clsx('nav-link', { active: isActive })}>
                        <i className={`bi ${item.icon}`} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <div className="nav-section-title">Support</div>
                {SUPPORT.map(item => (
                    <NavLink key={item.to} to={item.to}
                        className={({ isActive }) => clsx('nav-link', { active: isActive })}>
                        <i className={`bi ${item.icon}`} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </aside>
    )
}
