import { useDispatch, useSelector } from 'react-redux';
import { setText, generateSummary, clearSummary } from '../../redux/slices/summarySlice';

export default function SummaryGenerator({ userId }) {
  const dispatch = useDispatch();
  const { currentText, currentSummary, loading, error } = useSelector((state) => state.summary);

  const handleGenerateSummary = () => {
    if (!currentText.trim()) return;
    dispatch(generateSummary({ text: currentText, userId }));
  };

  const handleClear = () => {
    dispatch(clearSummary());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Text to Summarize
        </label>
        <textarea
          value={currentText}
          onChange={(e) => dispatch(setText(e.target.value))}
          maxLength={5000}
          className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Paste your text here..."
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleGenerateSummary}
            disabled={loading || !currentText.trim()}
            className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
          
          {currentSummary && (
            <button
              onClick={handleClear}
              className="cursor-pointer px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            Error: {error}
          </div>
        )}
      </div>
      {currentSummary.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
            <ul className="list-disc list-inside text-gray-900 space-y-2">
            {currentSummary?.map((point, index) => (
                <li key={index}>{point}</li>
            ))}
            </ul>
        </div>
        )}
    </div>
  );
}