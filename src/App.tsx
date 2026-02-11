import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ErrorBoundary } from './components/ui/index.ts';
import { BoardPage } from './pages/BoardPage/BoardPage.tsx';
import { TaskDetailPage } from './pages/TaskDetailPage/TaskDetailPage.tsx';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/Task-Manager">
        <TaskProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<BoardPage />} />
              <Route path="/task/:id" element={<TaskDetailPage />} />
            </Routes>
          </ToastProvider>
        </TaskProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
