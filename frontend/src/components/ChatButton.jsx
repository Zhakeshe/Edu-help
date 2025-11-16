import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await axios.post('/api/feedback', formData);
      setStatus({
        type: 'success',
        message: 'Хабарламаңыз жіберілді! Жақын арада жауап береміз.'
      });
      setFormData({ fullName: '', phone: '', message: '' });

      setTimeout(() => {
        setIsOpen(false);
        setStatus({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Қате орын алды'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform group"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6 group-hover:animate-bounce" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-slide-up">
          <div className="glass-card shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">Көмек керек пе?</h3>
              <p className="text-white/90 text-sm">Бізбен хабарласыңыз</p>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Аты-жөні *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Толық аты-жөніңіз"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон нөмірі *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Хабарлама *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="input-field resize-none"
                    placeholder="Сізге қалай көмектесе аламыз?"
                  />
                </div>

                {/* Status Message */}
                {status.message && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      status.type === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="spinner border-white" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Жіберу</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;
