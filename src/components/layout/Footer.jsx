import { memo } from 'react';
import { BookOpen, ExternalLink, Heart } from 'lucide-react';
import { GithubIcon } from '../icons/GithubIcon';
import packageJson from '../../../package.json';

export const Footer = memo(() => {
    const appVersion = import.meta.env.VITE_APP_VERSION || `v${packageJson.version}`;

    return (
        <footer className="mt-16 pt-10 pb-8 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Brand */}
                <div className="flex flex-col items-center md:items-start space-y-3">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                            Quiz Forge
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center md:text-left italic">
                        Empowering your learning journey by turning raw notes into powerful
                        knowledge tools. Forge your path to mastery.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Project
                        </span>
                        <div className="flex flex-col items-center space-y-1">
                            <a
                                href="https://github.com/tugamer89/quiz-forge"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center group transition-colors"
                            >
                                Project Source{' '}
                                <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                            <a
                                href="https://github.com/tugamer89/quiz-forge/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center group transition-colors"
                            >
                                Report an Issue{' '}
                                <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-400">
                            Built with
                        </span>
                        <div className="flex items-center space-x-3 text-xs">
                            <a
                                href="https://react.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                            >
                                React
                            </a>
                            <a
                                href="https://tailwindcss.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                            >
                                Tailwind
                            </a>
                            <a
                                href="https://lucide.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                            >
                                Lucide
                            </a>
                        </div>
                    </div>
                </div>

                {/* Credits */}
                <div className="flex flex-col items-center md:items-end space-y-4">
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Developed by
                        </span>
                        <a
                            href="https://github.com/tugamer89"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 group bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                        >
                            <span className="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">
                                Tugamer89
                            </span>
                            <GithubIcon className="w-5 h-5 fill-current text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Copyright & Version */}
            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 px-4">
                    <div className="flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>&copy; {new Date().getFullYear()} Quiz Forge. Crafted with</span>
                        <Heart className="w-3 h-3 text-red-500 fill-current mx-1 animate-pulse" />
                        <span>for lifelong learners.</span>
                    </div>

                    <div className="flex items-center">
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] font-semibold tracking-wider border border-slate-200 dark:border-slate-700 shadow-sm">
                            {appVersion}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
});
