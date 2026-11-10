import { LanguageProvider } from './i18n';
import { StudentProvider } from './context/StudentContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HomePage } from './pages/HomePage';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <StudentProvider>
          <HomePage />
        </StudentProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
