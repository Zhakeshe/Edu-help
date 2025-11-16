import { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, Image, FileText, ExternalLink, Star, TrendingUp } from 'lucide-react';

const AITools = () => {
  const [aiTools, setAiTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Барлығы');

  const categories = [
    'Барлығы',
    'Сурет генерациялау',
    'Мәтін генерациялау',
    'Видео генерациялау',
    'Аудио генерациялау'
  ];

  useEffect(() => {
    fetchAITools();
  }, []);

  const fetchAITools = async () => {
    try {
      const res = await axios.get('/api/ai-tools');
      setAiTools(res.data.data);
    } catch (error) {
      console.error('AI құралдарды жүктеу қатесі:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Сурет генерациялау':
        return <Image className="h-6 w-6" />;
      case 'Мәтін генерациялау':
        return <FileText className="h-6 w-6" />;
      default:
        return <Brain className="h-6 w-6" />;
    }
  };

  const filteredTools = selectedCategory === 'Барлығы'
    ? aiTools
    : aiTools.filter(tool => tool.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">AI Құралдар</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Сабақ материалдарын дайындауға көмектесетін AI құралдар
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* AI Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Әзірге құралдар жоқ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => (
            <div
              key={tool._id}
              className="glass-card p-6 card-hover group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-3 rounded-xl text-white group-hover:scale-110 transition-transform">
                  {getCategoryIcon(tool.category)}
                </div>
                {tool.isPremium && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                    Premium
                  </span>
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                {tool.name}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {tool.description}
              </p>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {tool.category}
                </span>
              </div>

              {/* Features */}
              {tool.features && tool.features.length > 0 && (
                <div className="mb-4">
                  <ul className="space-y-1">
                    {tool.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{tool.rating || 0}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{tool.usageCount || 0} қолданыс</span>
                </div>
              </div>

              {/* Action Button */}
              {tool.url && (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full btn-primary"
                >
                  <span>Пайдалану</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 glass-card p-8">
        <h3 className="text-2xl font-bold mb-4 text-center">
          AI құралдарды қалай пайдалануға болады?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Image className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Сурет генерациялау</h4>
              <p className="text-sm text-gray-600">
                Презентацияларға және жұмыс парақтарына арналған суреттер жасаңыз
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-secondary-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Мәтін генерациялау</h4>
              <p className="text-sm text-gray-600">
                ҚМЖ және тапсырмалар үшін мәтіндер жасаңыз
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;
