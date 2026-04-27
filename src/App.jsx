// Shared Components
import { CustomDialog } from './components/CustomDialog';
import { Toast } from './components/Toast';
import { SummaryScreen } from './components/SummaryScreen';

// Layout & Features
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SidebarControls } from './components/features/SidebarControls';
import { DeckOverview } from './components/features/DeckOverview';
import { LiveSession } from './components/features/LiveSession';

// Hooks
import { useAppUI } from './hooks/useAppUI';
import { useQuizData } from './hooks/useQuizData';
import { useQuizSession } from './hooks/useQuizSession';

export default function App() {
  const ui = useAppUI();
  const data = useQuizData(ui.showToast, ui.setDialog);
  const session = useQuizSession(
    data.questions,
    data.setQuestions,
    data.settings,
    data.selectedDeckId,
    ui.showToast
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 md:p-8 transition-colors duration-200 selection:bg-indigo-200 dark:selection:bg-indigo-900">
      <Toast toast={ui.toast} />
      {ui.dialog.isOpen && (
        <CustomDialog dialog={ui.dialog} onClose={() => ui.setDialog({ isOpen: false })} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <Header
          decks={data.decks}
          questions={data.questions}
          rawTexts={data.rawTexts}
          setDecks={data.setDecks}
          setQuestions={data.setQuestions}
          setRawTexts={data.setRawTexts}
          showToast={ui.showToast}
          deferredPrompt={ui.deferredPrompt}
          isDarkMode={ui.isDarkMode}
          toggleTheme={ui.toggleTheme}
          onInstall={ui.handleInstallApp}
          onExport={data.handleExport}
          onImport={data.handleImport}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <SidebarControls
              decks={data.decks}
              selectedDeckId={data.selectedDeckId}
              onSelectDeck={(id) => {
                data.setSelectedDeckId(id);
                session.cancelSession();
              }}
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
              onGenerateQuiz={session.generateQuiz}
            />
          </div>

          <div className="lg:col-span-2 relative min-h-125 lg:min-h-0">
            <div className="lg:absolute lg:inset-0 w-full h-full flex flex-col space-y-6">
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
                  onPlayAgain={session.generateQuiz}
                />
              )}
              {!session.quizSession.active && !session.quizSession.isFinished && (
                <DeckOverview
                  questions={data.activeDeckQuestions}
                  stats={data.stats}
                  onMarkQuestion={data.handleMarkQuestion}
                />
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
