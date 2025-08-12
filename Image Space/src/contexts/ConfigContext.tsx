import { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, ContextProviderProps } from '@/lib/types';
import { localStorageUtils } from '@/lib/utils';

// 定义上下文类型
interface ConfigContextType {
  itemsPerRow: number;
  setItemsPerRow: (count: number) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

// 创建上下文
const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// 上下文提供者组件
export function ConfigProvider({ children }: ContextProviderProps) {
  const [itemsPerRow, setItemsPerRow] = useState<number>(3); // 默认每行3张图片
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // 默认不是管理员

  // 从localStorage加载配置
  useEffect(() => {
    const savedConfig = localStorageUtils.getItem<AppConfig>('appConfig');
    if (savedConfig) {
      setItemsPerRow(savedConfig.itemsPerRow || 3);
    }
    
    // 检查是否是管理员（这里简化处理，实际应用中应该有更安全的验证）
    const adminStatus = localStorageUtils.getItem<boolean>('isAdmin');
    setIsAdmin(adminStatus || false);
  }, []);

  // 保存配置到localStorage
  useEffect(() => {
    localStorageUtils.setItem('appConfig', {
      itemsPerRow,
      currentTags: [],
      searchQuery: ''
    });
    
    localStorageUtils.setItem('isAdmin', isAdmin);
  }, [itemsPerRow, isAdmin]);

  // 更新每行显示的图片数量
  const updateItemsPerRow = (count: number) => {
    if (count >= 2 && count <= 4) { // 限制每行2-4张图片
      setItemsPerRow(count);
    }
  };

  return (
    <ConfigContext.Provider value={{
      itemsPerRow,
      setItemsPerRow: updateItemsPerRow,
      isAdmin,
      setIsAdmin
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

// 自定义hook，方便组件使用上下文
export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
}