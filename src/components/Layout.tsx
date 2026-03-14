import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-muted/10 pb-16 lg:pb-0">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
