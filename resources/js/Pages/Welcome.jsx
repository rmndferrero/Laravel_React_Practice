import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#FF0000] selection:text-white">
                <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-[#FF5555]/80">
                            Welcome to
                        </p>
                        <h1 className="text-5xl font-bold leading-tight tracking-[-0.04em] text-[#FF0000] sm:text-6xl lg:text-7xl">
                            TaskMS
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                            Loerm ipsum dolor sit amet consectetur adipisicing elit. Doloribus
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
                            <Link
                                href={route('login')}
                                className="inline-flex min-w-[140px] items-center justify-center rounded-md border border-[#FF0000] bg-[#FF0000] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#e60000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                            >
                                Login
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-flex min-w-[140px] items-center justify-center rounded-md border border-[#FF0000] bg-transparent px-8 py-3 text-base font-semibold text-[#FF0000] transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                            >
                                Register
                            </Link>
                        </div>
                        {auth.user && (
                            <div className="mt-6 text-sm text-white/60">
                                Already logged in?{' '}
                                <Link href={route('contacts.index')} className="font-semibold text-[#FF0000] hover:text-[#FF5555]">
                                    Go to dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                    <footer className="mt-10 text-center text-xs uppercase tracking-[0.24em] text-white/30">
                        Laravel v{laravelVersion} · PHP v{phpVersion}
                    </footer>
                </div>
            </div>
        </>
    );
}
