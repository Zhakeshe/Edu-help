import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Download, FileText, ArrowLeft, Calendar, Filter, Eye, X } from 'lucide-react';

const MaterialsView = () => {
  const { classNumber } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchClassData();
  }, [classNumber]);

  const fetchClassData = async () => {
    try {
      const res = await axios.get(`/api/classes/${classNumber}`);
      setClassData(res.data.data);
    } catch (error) {
      console.error('Сынып деректерін жүктеу қатесі:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      const res = await axios.get(`/api/materials/download/${material._id}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.fileName); // Дұрыс fileName қолдану
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Memory leak-тен сақтау
    } catch (error) {
      console.error('Жүктеу қатесі:', error);
      alert('Файлды жүктеу мүмкін болмады');
    }
  };

  const getFileTypeCategory = (fileType) => {
    if (!fileType) return 'other';
    const type = fileType.toUpperCase();
    if (['PDF', 'DOC', 'DOCX', 'TXT', 'MD'].includes(type)) return 'text';
    if (['PPT', 'PPTX'].includes(type)) return 'presentation';
    if (['PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(type)) return 'image';
    if (['MP3', 'WAV', 'OGG', 'M4A'].includes(type)) return 'audio';
    if (['MP4', 'AVI', 'MOV', 'MKV', 'WEBM'].includes(type)) return 'video';
    if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(type)) return 'archive';
    if (['XLS', 'XLSX', 'CSV'].includes(type)) return 'spreadsheet';
    return 'other';
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return '📎';
    const type = fileType.toUpperCase();
    if (type === 'PDF') return '📄';
    if (['DOC', 'DOCX'].includes(type)) return '📝';
    if (['PPT', 'PPTX'].includes(type)) return '📊';
    if (['PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(type)) return '🖼️';
    if (['TXT', 'MD'].includes(type)) return '📝';
    if (['ZIP', 'RAR', '7Z'].includes(type)) return '📦';
    if (['MP4', 'AVI', 'MOV', 'MKV'].includes(type)) return '🎥';
    if (['MP3', 'WAV', 'OGG'].includes(type)) return '🎵';
    if (['XLS', 'XLSX', 'CSV'].includes(type)) return '📊';
    return `📎`;
  };

  const filterMaterials = (materials) => {
    if (fileTypeFilter === 'all') return materials;
    return materials.filter(material => {
      const materialFileType = material.fileType || material.files?.[0]?.fileType;
      return getFileTypeCategory(materialFileType) === fileTypeFilter;
    });
  };

  const handlePreview = (material) => {
    setPreviewMaterial(material);
    setShowPreview(true);
  };

  const canPreview = (fileType) => {
    if (!fileType) return false;
    const type = fileType.toUpperCase();
    // Preview қолдау: PDF, суреттер, видео, аудио
    return ['PDF', 'PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG', 'MP4', 'WEBM', 'MP3', 'WAV', 'OGG', 'TXT'].includes(type);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Деректер табылмады</p>
      </div>
    );
  }

  const currentQuarter = classData.quarters[selectedQuarter - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Артқа қайту</span>
      </Link>

      {/* Header */}
      <div className="glass-card p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="gradient-text">{classData.name}</span>
        </h1>
        <p className="text-gray-600">
          Тоқсан бойынша материалдарды таңдаңыз
        </p>
      </div>

      {/* Quarter Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {classData.quarters.map((quarter) => (
          <button
            key={quarter.number}
            onClick={() => setSelectedQuarter(quarter.number)}
            className={`glass-card p-4 text-center transition-all ${
              selectedQuarter === quarter.number
                ? 'border-2 border-primary-500 bg-primary-50'
                : 'hover:border-2 hover:border-primary-300'
            }`}
          >
            <Calendar className={`h-6 w-6 mx-auto mb-2 ${
              selectedQuarter === quarter.number ? 'text-primary-600' : 'text-gray-600'
            }`} />
            <h3 className="font-semibold">{quarter.name}</h3>
          </button>
        ))}
      </div>

      {/* File Type Filter */}
      <div className="glass-card p-4 mb-8">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-700">Файл түрі бойынша фильтрлеу:</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Барлығы', icon: '📁' },
            { value: 'text', label: 'Мәтін', icon: '📝' },
            { value: 'presentation', label: 'Презентация', icon: '📊' },
            { value: 'image', label: 'Сурет', icon: '🖼️' },
            { value: 'audio', label: 'Аудио', icon: '🎵' },
            { value: 'video', label: 'Видео', icon: '🎥' },
            { value: 'archive', label: 'Архив', icon: '📦' },
            { value: 'spreadsheet', label: 'Кесте', icon: '📊' },
            { value: 'other', label: 'Басқа', icon: '📎' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFileTypeFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                fileTypeFilter === filter.value
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials by Category */}
      <div className="space-y-8">
        {Object.entries(currentQuarter.materials).map(([category, materials]) => {
          const filteredMaterials = filterMaterials(materials);
          return (
            <div key={category} className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary-600" />
                <span>{category}</span>
                <span className="text-sm font-normal text-gray-500">
                  ({filteredMaterials.length} / {materials.length})
                </span>
              </h2>

              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    {materials.length === 0 ? 'Әзірге материалдар жоқ' : 'Таңдалған фильтрге сай материал жоқ'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((material) => (
                  <div
                    key={material._id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                          {material.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {material.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Download className="h-4 w-4" />
                        <span>{material.downloads || 0}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {canPreview(material.fileType) && (
                          <button
                            onClick={() => handlePreview(material)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Көру</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(material)}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                        >
                          Жүктеу
                        </button>
                      </div>
                    </div>

                    {/* Files List */}
                    <div className="mt-2 space-y-1">
                      {material.files && material.files.length > 0 ? (
                        // Бірнеше файл
                        material.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-primary-600">#{index + 1}</span>
                              <span className="text-gray-600">
                                {getFileIcon(file.fileType)} {file.fileType?.toUpperCase() || 'FILE'}
                              </span>
                            </div>
                            {file.fileSize && (
                              <span className="text-gray-400">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} МБ
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        // Бір файл (ескі формат)
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {getFileIcon(material.fileType)} {material.fileType?.toUpperCase() || 'FILE'}
                          </span>
                          {material.fileSize && (
                            <span className="text-gray-400">
                              {(material.fileSize / 1024 / 1024).toFixed(2)} МБ
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        })}
      </div>

      {/* Preview Modal */}
      {showPreview && previewMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{previewMaterial.title}</h2>
                <p className="text-sm text-gray-500">{previewMaterial.description}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4">
              {/* PDF Preview */}
              {previewMaterial.fileType?.toUpperCase() === 'PDF' && (
                <iframe
                  src={`/api/materials/preview/${previewMaterial._id}`}
                  className="w-full h-[600px] border rounded"
                  title="PDF Preview"
                />
              )}

              {/* Image Preview */}
              {['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG'].includes(previewMaterial.fileType?.toUpperCase()) && (
                <div className="flex items-center justify-center">
                  <img
                    src={`/api/materials/preview/${previewMaterial._id}`}
                    alt={previewMaterial.title}
                    className="max-w-full max-h-[600px] object-contain rounded"
                  />
                </div>
              )}

              {/* Video Preview */}
              {['MP4', 'WEBM'].includes(previewMaterial.fileType?.toUpperCase()) && (
                <video
                  src={`/api/materials/preview/${previewMaterial._id}`}
                  controls
                  className="w-full max-h-[600px] rounded"
                />
              )}

              {/* Audio Preview */}
              {['MP3', 'WAV', 'OGG'].includes(previewMaterial.fileType?.toUpperCase()) && (
                <div className="flex items-center justify-center py-20">
                  <audio
                    src={`/api/materials/preview/${previewMaterial._id}`}
                    controls
                    className="w-full max-w-lg"
                  />
                </div>
              )}

              {/* Text Preview */}
              {previewMaterial.fileType?.toUpperCase() === 'TXT' && (
                <iframe
                  src={`/api/materials/preview/${previewMaterial._id}`}
                  className="w-full h-[600px] border rounded"
                  title="Text Preview"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => handleDownload(previewMaterial)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Жүктеу</span>
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Жабу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsView;
