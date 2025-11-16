import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Мұғалімдерге арналған #1 платформа</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">EduHelp</span>
            <br />
            <span className="text-gray-800">Білім беру материалдары</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            2-11 сыныптарға арналған ҚМЖ, презентациялар және жұмыс парақтары.
            <br />
            AI құралдар арқылы материалдар жасаңыз!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#classes"
              className="btn-primary flex items-center space-x-2 group"
            >
              <BookOpen className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span>Материалдарға өту</span>
            </a>
            <a
              href="/ai-tools"
              className="btn-secondary flex items-center space-x-2 group"
            >
              <TrendingUp className="h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
              <span>AI құралдар</span>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 card-hover">
              <div className="text-4xl font-bold gradient-text mb-2">10+</div>
              <div className="text-gray-600">Сыныптар</div>
            </div>
            <div className="glass-card p-6 card-hover">
              <div className="text-4xl font-bold gradient-text mb-2">100+</div>
              <div className="text-gray-600">Материалдар</div>
            </div>
            <div className="glass-card p-6 card-hover">
              <div className="text-4xl font-bold gradient-text mb-2">AI</div>
              <div className="text-gray-600">Құралдар</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
