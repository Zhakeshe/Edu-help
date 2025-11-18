import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Trash2, Check, X } from 'lucide-react';

const MaterialUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classNumber: '2',
    quarter: '1',
    category: 'ҚМЖ',
    subject: ''
  });
  const [files, setFiles] = useState([]);
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

    if (!files || files.length === 0) {
      setStatus({ type: 'error', message: 'Кем дегенде бір файл таңдаңыз' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const data = new FormData();

    // Барлық файлдарды қосу
    files.forEach(file => {
      data.append('files', file);
    });

    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      const res = await axios.post('/api/materials/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus({
        type: 'success',
        message: `${res.data.filesCount} файл жүктелді!`
      });
      setFormData({
        title: '',
        description: '',
        classNumber: '2',
        quarter: '1',
        category: 'ҚМЖ',
        subject: ''
      });
      setFiles([]);
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
                <option value="Суреттер">Суреттер</option>
                <option value="Басқа">Басқа</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Файл(дар) * (бірнеше файл таңдай аласыз)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                required={files.length === 0}
                multiple
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Кез келген файл жүктеуге болады (PDF, DOCX, PPTX, TXT, PNG, JPG, MP3, MP4, ZIP, т.б.)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                📦 Бірнеше файл бірден таңдап жүктей аласыз (макс. 20 файл, әр файл макс. 100MB)
              </p>
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Қауіпті файлдар (.exe, .bat, .sh) рұқсат етілмейді
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Таңдалған файлдар ({files.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Барлығын өшіру
                </button>
              </div>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 ml-3 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Файлдар</th>
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
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {material.files?.length || 1} файл
                    </span>
                  </td>
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
