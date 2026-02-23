import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MaterialUpload from './MaterialUpload';
import FeedbackManagement from './FeedbackManagement';
import { Upload, MessageSquare, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');

  const tabs = [
    { id: 'materials', name: '??????????? ??????', icon: Upload },
    { id: 'feedback', name: '???? ????????', icon: MessageSquare }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-xl">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">????? ??????</h1>
            <p className="text-gray-600">??? ????????, {user?.fullName || user?.email}!</p>
          </div>
        </div>
      </div>

      <div className="glass-card mb-8">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'materials' && <MaterialUpload />}
        {activeTab === 'feedback' && <FeedbackManagement />}
      </div>
    </div>
  );
};

export default Dashboard;
