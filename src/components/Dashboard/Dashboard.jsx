import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import SummaryGenerator from '../Summary/SummaryGenerator';
import HistoryList from '../History/HistoryList';

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('summary');

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">AI Summary</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="cursor-pointer text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('summary')}
            className={`cursor-pointer px-4 py-2 rounded-md transition ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Generate Summary
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`cursor-pointer px-4 py-2 rounded-md transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'summary' ? (
          <SummaryGenerator userId={user.uid} />
        ) : (
          <HistoryList userId={user.uid} />
        )}
      </div>
    </div>
  );
}