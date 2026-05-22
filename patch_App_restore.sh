#!/bin/bash
cat << 'INNER_EOF' > src/App.jsx
import { Suspense, lazy, useMemo } from 'react';

import { CustomDialog } from './components/CustomDialog';
import { Toast } from './components/Toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SidebarControls } from './components/features/SidebarControls';

const DeckOverview = lazy(() =>
    import('./components/features/DeckOverview').then((m) => ({ default: m.DeckOverview }))
);
const SummaryScreen = lazy(() =>
    import('./components/SummaryScreen').then((m) => ({ default: m.SummaryScreen }))
);
const LiveSession = lazy(() =>
    import('./components/features/LiveSession').then((m) => ({ default: m.LiveSession }))
);

import { useAppUI } from './hooks/useAppUI';
import { useQuizData } from './hooks/useQuizData';
import { useQuizSession } from './hooks/useQuizSession';
import { useActivityLog } from './hooks/useActivityLog';

export default function App() {
    const ui = useAppUI();
    const { activityLog, logStudyActivity } = useActivityLog();
    const data = useQuizData(ui.showToast, ui.setDialog);
    const currentDeckLog = useMemo(() => {
        return activityLog[data.selectedDeckId] || {};
    }, [activityLog, data.selectedDeckId]);
    const session = useQuizSession(
        data.questions,
        data.setQuestions,
        data.settings,
        data.selectedDeckId,
        ui.showToast,
        logStudyActivity
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 md:p-8 transition-colors duration-200 selection:bg-indigo-200 dark:selection:bg-indigo-900">
            <Toast toast={ui.toast} />
            {ui.dialog.isOpen && (
                <CustomDialog dialog={ui.dialog} onClose={() => ui.setDialog({ isOpen: false })} />
            )}

            <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
                <Header onImportExportClick={data.handleImportExportClick} />

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 min-h-0 relative">
                    <div className="lg:col-span-1 lg:overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        <SidebarControls
                            decks={data.decks}
                            selectedDeckId={data.selectedDeckId}
                            onSelectDeck={data.setSelectedDeckId}
                            onAddDeck={data.handleAddDeckClick}
                            onDeleteDeck={data.handleDeleteDeckClick}
                            currentRawText={data.currentRawText}
                            onRawTextChange={data.handleRawTextChange}
                            isTyping={data.isTyping}
                            onCopyText={data.handleCopyText}
                            onClearText={data.handleClearTextClick}
                            settings={data.settings}
                            onSettingsChange={data.setSettings}
                            activeDeckQuestionsLength={data.activeDeckQuestions.length}
                            stats={data.stats}
                            onGenerateQuiz={() => session.generateQuiz()}
                            deckLog={currentDeckLog}
                        />
                    </div>

                    <div className="lg:col-span-2 relative min-h-125 lg:min-h-0">
                        <div className="lg:absolute lg:inset-0 w-full h-full flex flex-col space-y-6">
                            <Suspense
                                fallback={
                                    <div className="w-full h-full flex items-center justify-center animate-pulse bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
                                        Loading...
                                    </div>
                                }
                            >
                                {session.quizSession.active && !session.quizSession.isFinished && (
                                    <LiveSession
                                        session={session.quizSession}
                                        showAnswer={session.showAnswer}
                                        onCancel={session.cancelSession}
                                        onReveal={session.revealAnswer}
                                        onAnswer={session.handleAnswer}
                                    />
                                )}
                                {session.quizSession.isFinished && (
                                    <SummaryScreen
                                        session={session.quizSession}
                                        onReset={session.resetSession}
                                        onPlayAgain={() => session.generateQuiz()}
                                    />
                                )}
                                {!session.quizSession.active && !session.quizSession.isFinished && (
                                    <DeckOverview
                                        questions={data.activeDeckQuestions}
                                        stats={data.stats}
                                        onMarkQuestion={data.handleMarkQuestion}
                                        onStartCustomSession={(filters) => session.generateQuiz(filters)}
                                    />
                                )}
                            </Suspense>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}
INNER_EOF
