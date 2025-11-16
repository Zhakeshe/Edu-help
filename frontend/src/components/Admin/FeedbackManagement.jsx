import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Trash2, Eye, CheckCircle } from 'lucide-react';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState('барлығы');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/api/feedback');
      setFeedbacks(res.data.data);
    } catch (error) {
      console.error('Кері байланыстарды жүктеу қатесі:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (feedbackId) => {
    if (!response.trim()) {
      alert('Жауап мәтінін енгізіңіз');
      return;
    }

    try {
      await axios.put(`/api/feedback/${feedbackId}/respond`, {
        adminResponse: response
      });

      alert('Жауап жіберілді!');
      setResponse('');
      setSelectedFeedback(null);
      fetchFeedbacks();
    } catch (error) {
      alert('Жауап жіберу қатесі');
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Хабарламаны өшіруге сенімдісіз бе?')) return;

    try {
      await axios.delete(`/api/feedback/${feedbackId}`);
      alert('Хабарлама өшірілді');
      fetchFeedbacks();
    } catch (error) {
      alert('Өшіру қатесі');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'жаңа': 'bg-blue-100 text-blue-700',
      'оқылды': 'bg-yellow-100 text-yellow-700',
      'жауап берілді': 'bg-green-100 text-green-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {status}
      </span>
    );
  };

  const filteredFeedbacks = filter === 'барлығы'
    ? feedbacks
    : feedbacks.filter(f => f.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Барлығы', count: feedbacks.length, color: 'primary' },
          { label: 'Жаңа', count: feedbacks.filter(f => f.status === 'жаңа').length, color: 'blue' },
          { label: 'Оқылды', count: feedbacks.filter(f => f.status === 'оқылды').length, color: 'yellow' },
          { label: 'Жауап берілді', count: feedbacks.filter(f => f.status === 'жауап берілді').length, color: 'green' }
        ].map((stat, index) => (
          <div key={index} className="glass-card p-6">
            <div className="text-3xl font-bold gradient-text mb-2">
              {stat.count}
            </div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          {['барлығы', 'жаңа', 'оқылды', 'жауап берілді'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary-600" />
          <span>Кері байланыстар ({filteredFeedbacks.length})</span>
        </h2>

        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Хабарламалар жоқ
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{feedback.fullName}</h3>
                    <p className="text-sm text-gray-600">{feedback.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(feedback.createdAt).toLocaleString('kk-KZ')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(feedback.status)}
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700">{feedback.message}</p>
                </div>

                {/* Admin Response */}
                {feedback.adminResponse && (
                  <div className="bg-primary-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">Жауап:</span>
                    </div>
                    <p className="text-gray-700">{feedback.adminResponse}</p>
                    {feedback.respondedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(feedback.respondedAt).toLocaleString('kk-KZ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {!feedback.adminResponse && (
                    <button
                      onClick={() => setSelectedFeedback(
                        selectedFeedback === feedback._id ? null : feedback._id
                      )}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>Жауап беру</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(feedback._id)}
                    className="flex items-center space-x-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Өшіру</span>
                  </button>
                </div>

                {/* Response Form */}
                {selectedFeedback === feedback._id && !feedback.adminResponse && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows="4"
                      className="input-field resize-none mb-3"
                      placeholder="Жауабыңызды жазыңыз..."
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRespond(feedback._id)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Жіберу</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFeedback(null);
                          setResponse('');
                        }}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Болдырмау
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
