import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Trash2, Check } from 'lucide-react';

const MaterialUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classNumber: '2',
    quarter: '1',
    category: 'ҚМЖ',
    subject: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('/api/materials');
      setMaterials(res.data.data);
    } catch (error) {
      console.error('Материалдарды жүктеу қатесі:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus({ type: 'error', message: 'Файл таңдаңыз' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const data = new FormData();
    data.append('file', file);
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      await axios.post('/api/materials/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus({ type: 'success', message: 'Материал жүктелді!' });
      setFormData({
        title: '',
        description: '',
        classNumber: '2',
        quarter: '1',
        category: 'ҚМЖ',
        subject: ''
      });
      setFile(null);
      fetchMaterials();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Қате орын алды'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Материалды өшіруге сенімдісіз бе?')) return;

    try {
      await axios.delete(`/api/materials/${id}`);
      setStatus({ type: 'success', message: 'Материал өшірілді' });
      fetchMaterials();
    } catch (error) {
      setStatus({ type: 'error', message: 'Өшіру қатесі' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <Upload className="h-6 w-6 text-primary-600" />
          <span>Жаңа материал жүктеу</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тақырып *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Материал тақырыбы"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пән
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-field"
                placeholder="Мысалы: Математика"
              />
            </div>

            {/* Class Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сынып *
              </label>
              <select
                name="classNumber"
                value={formData.classNumber}
                onChange={handleChange}
                required
                className="input-field"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                  <option key={num} value={num}>{num} сынып</option>
                ))}
              </select>
            </div>

            {/* Quarter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тоқсан *
              </label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={handleChange}
                required
                className="input-field"
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}-тоқсан</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="ҚМЖ">ҚМЖ</option>
                <option value="Презентациялар">Презентациялар</option>
                <option value="Жұмыс парақтары">Жұмыс парақтары</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Файл *
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                required
                className="input-field"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Таңдалды: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сипаттама
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input-field resize-none"
              placeholder="Материал туралы қысқаша сипаттама"
            />
          </div>

          {/* Status Message */}
          {status.message && (
            <div
              className={`p-4 rounded-lg flex items-center space-x-2 ${
                status.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {status.type === 'success' && <Check className="h-5 w-5" />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="spinner border-white" />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Жүктеу</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Materials List */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary-600" />
          <span>Жүктелген материалдар ({materials.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тақырып</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сынып</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тоқсан</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.slice(0, 10).map((material) => (
                <tr key={material._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{material.title}</td>
                  <td className="px-4 py-3 text-sm">{material.classNumber}</td>
                  <td className="px-4 py-3 text-sm">{material.quarter}</td>
                  <td className="px-4 py-3 text-sm">{material.category}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaterialUpload;
