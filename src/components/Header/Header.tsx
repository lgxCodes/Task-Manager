import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/index.ts';
import { useTheme } from '../../hooks/useTheme.ts';

type HeaderProps = {
  onCreateClick: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

const iconBtnClass =
  'bg-transparent border border-border rounded-lg px-2.5 py-1.5 cursor-pointer text-text-primary hover:bg-column-hover transition-colors';

export function Header({ onCreateClick, onExport, onImport }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  }

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-surface border-b border-border sticky top-0 z-10">
      <Link to="/" className="no-underline text-inherit" draggable={false}>
        <h1 className="m-0 text-lg sm:text-xl font-bold">Task Manager</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Button onClick={onCreateClick}>+ New Task</Button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={iconBtnClass}
            aria-label="More options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            title="More options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-36 z-20" role="menu">
              <button
                role="menuitem"
                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-text-primary bg-transparent border-none cursor-pointer hover:bg-column-hover transition-colors"
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button
                role="menuitem"
                onClick={() => { onExport(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-text-primary bg-transparent border-none cursor-pointer hover:bg-column-hover transition-colors"
              >
                Export tasks
              </button>
              <button
                role="menuitem"
                onClick={() => { fileInputRef.current?.click(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-text-primary bg-transparent border-none cursor-pointer hover:bg-column-hover transition-colors"
              >
                Import tasks
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </header>
  );
}
