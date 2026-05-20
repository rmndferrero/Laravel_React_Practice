import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FF0000] selection:text-white">
            <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm w-full sm:max-w-md">
                    <div className="mb-6 text-center">
                        <Link href="/" className="text-xl font-bold text-[#FF0000]">
                            ContactMS
                        </Link>
                    </div>

                    <div className="text-left text-white">{children}</div>
                </div>
            </div>
        </div>
    );
}
