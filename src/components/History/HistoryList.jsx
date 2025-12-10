import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function HistoryList({ userId }) {
  const [histories, setHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, 'summaries'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistories(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
        Loading history...
      </div>
    );
  }

  if (histories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
        No summaries yet. Generate your first summary!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {histories.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-3">
            {new Date(item.timestamp).toLocaleString()}
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Original Text</h4>
              <p className="text-sm text-gray-600 line-clamp-3">{item.originalText}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
              <p className="text-sm text-gray-900">{item.summary}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

