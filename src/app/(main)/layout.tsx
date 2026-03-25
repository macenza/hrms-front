import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <Sidebar />
            <div className="flex flex-col min-h-screen transition-all duration-300 md:pl-[250px]">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}