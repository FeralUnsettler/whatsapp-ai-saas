import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 lg:ml-0 overflow-auto">
                <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
