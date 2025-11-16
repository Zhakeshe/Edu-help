import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, FileText, ArrowRight } from 'lucide-react';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes');
      setClasses(res.data.data);
    } catch (error) {
      console.error('Сыныптарды жүктеу қатесі:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div id="classes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Сыныптар бойынша материалдар</span>
        </h2>
        <p className="text-gray-600 text-lg">
          Өзіңізге қажетті сыныпты таңдаңыз
        </p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {classes.map((classItem) => (
          <Link
            key={classItem.number}
            to={`/class/${classItem.number}`}
            className="group"
          >
            <div className="glass-card p-6 card-hover text-center group-hover:border-primary-500 border-2 border-transparent">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Class Number */}
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                {classItem.number} сынып
              </h3>

              {/* Materials Count */}
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                <FileText className="h-4 w-4" />
                <span className="text-sm">
                  {classItem.materialsCount} материал
                </span>
              </div>

              {/* View Button */}
              <div className="flex items-center justify-center space-x-2 text-primary-600 font-medium group-hover:space-x-3 transition-all">
                <span>Көру</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Card */}
      <div className="mt-12 glass-card p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">
          Әр сыныпта қандай материалдар бар?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="text-3xl mb-2">📚</div>
            <h4 className="font-semibold text-primary-700 mb-1">ҚМЖ</h4>
            <p className="text-sm text-gray-600">Қысқа мерзімді жоспарлар</p>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg">
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-semibold text-secondary-700 mb-1">Презентациялар</h4>
            <p className="text-sm text-gray-600">PowerPoint материалдары</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg">
            <div className="text-3xl mb-2">📝</div>
            <h4 className="font-semibold text-pink-700 mb-1">Жұмыс парақтары</h4>
            <p className="text-sm text-gray-600">Тапсырмалар мен жаттығулар</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesList;
