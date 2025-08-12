import { Link } from 'react-router-dom';
import { useConfigContext } from '@/contexts/ConfigContext';

export function Header() {
  const { isAdmin, setIsAdmin } = useConfigContext();
  
  return (
    <header className="bg-gradient-to-r from-amber-50 to-orange-100 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i class="fa-solid fa-image text-orange-500 text-2xl"></i>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
            Image Space
          </h1>
        </div>
        
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-orange-700 hover:text-orange-500 font-medium transition-colors"
          >
            图片库
          </Link>
          <Link 
            to="/dataset" 
            className="text-orange-700 hover:text-orange-500 font-medium transition-colors"
          >
            数据集说明
          </Link>
          
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isAdmin 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {isAdmin ? '管理员模式' : '切换管理员'}
          </button>
        </nav>
      </div>
    </header>
  );
}