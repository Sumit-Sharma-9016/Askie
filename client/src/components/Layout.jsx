import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function Layout({ children }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
        <div className="px-4 py-5 flex items-center justify-between">
          <a
            href="/"
            className="font-extrabold text-3xl tracking-tight text-cyan-600 dark:text-indigo-400"
          >
            Askie ✨
          </a>
          <div className="flex items-center gap-4">
            <a
              className="hover:text-cyan-500 dark:hover:text-indigo-400 transition"
              href="/"
            >
              Home
            </a>
            <button
              onClick={toggleTheme}
              className="btn px-4 py-1 text-sm"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 space-y-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 py-4 text-sm">
        Made with <span className="text-red-500">❤</span> by <span className="font-semibold"><a href="https://www.linkedin.com/in/sumit-sharma-347092282/">Sumit Sharma</a></span>
      </footer>

    </div>
  );
}
