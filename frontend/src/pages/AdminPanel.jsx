import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Admin/Dashboard';

const AdminPanel = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return <Dashboard />;
};

export default AdminPanel;
