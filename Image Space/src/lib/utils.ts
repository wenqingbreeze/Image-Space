import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from 'uuid';

// 合并Tailwind类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 生成唯一ID
export function generateId(): string {
  return uuidv4();
}

// 日期格式化
export function formatDate(date: Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// LocalStorage工具
export const localStorageUtils = {
  // 保存数据到localStorage
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // 从localStorage获取数据
  getItem: <T>(key: string): T | null => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },

  // 从localStorage移除数据
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};
