import { useState } from 'react';
import { Annotation } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface AnnotationPopoverProps {
  annotations: Annotation[];
  onDeleteAnnotation: (id: string) => void;
}

export function AnnotationPopover({ annotations, onDeleteAnnotation }: AnnotationPopoverProps) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative inline-block">
      {/* 批注指示器 */}
      <button
        onClick={() => setShowPopover(!showPopover)}
        className="relative w-5 h-5"
        title="查看批注"
      >
        <div className="absolute inset-0 rounded-full bg-red-500"></div>
        <div className="absolute inset-1 rounded-full bg-white"></div>
      </button>

      {/* 批注弹窗 */}
      {showPopover && (
        <div className="absolute z-10 right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-900">批注 ({annotations.length})</h4>
            <button
              onClick={() => setShowPopover(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {annotations.map(annotation => (
              <div key={annotation.id} className="text-sm">
                <div className="flex justify-between items-start">
                  <p className="text-gray-700 whitespace-pre-line">{annotation.content}</p>
                  <button
                    onClick={() => onDeleteAnnotation(annotation.id)}
                    className="text-red-400 hover:text-red-500 ml-2"
                    title="删除批注"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(annotation.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}