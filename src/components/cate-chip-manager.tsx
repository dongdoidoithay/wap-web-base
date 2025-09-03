'use client';

import { useState } from 'react';

// Simple SVG icons as components
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

interface CateChip {
  id: string;
  name: string;
  description: string;
  "api-path": string;
  "active-default"?: boolean;
  type?: string;
}

interface CateChipManagerProps {
  cateChips: CateChip[];
  onChange: (cateChips: CateChip[]) => void;
}

export function CateChipManager({ cateChips, onChange }: CateChipManagerProps) {
  const [newCateChip, setNewCateChip] = useState({
    id: '',
    name: '',
    description: '',
    "api-path": '',
    "active-default": false,
    type: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addOrUpdateCateChip = () => {
    if (newCateChip.id.trim() && newCateChip.name.trim()) {
      const updatedCateChips = [...cateChips];
      
      if (editingIndex !== null) {
        // Update existing
        updatedCateChips[editingIndex] = { ...newCateChip };
        setEditingIndex(null);
      } else {
        // Add new
        if (!cateChips.some(chip => chip.id === newCateChip.id)) {
          updatedCateChips.push({ ...newCateChip });
        }
      }
      
      onChange(updatedCateChips);
      resetForm();
    }
  };

  const removeCateChip = (index: number) => {
    const updatedCateChips = cateChips.filter((_, i) => i !== index);
    onChange(updatedCateChips);
    
    if (editingIndex === index) {
      setEditingIndex(null);
      resetForm();
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const editCateChip = (index: number) => {
    setNewCateChip({ 
      ...cateChips[index], 
      "active-default": cateChips[index]["active-default"] || false,
      type: cateChips[index].type || ''
    });
    setEditingIndex(index);
  };

  const resetForm = () => {
    setNewCateChip({
      id: '',
      name: '',
      description: '',
      "api-path": '',
      "active-default": false,
      type: ''
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addOrUpdateCateChip();
    }
  };

  const toggleActiveDefault = (index: number) => {
    const updatedCateChips = [...cateChips];
    // Set all to false first
    updatedCateChips.forEach(chip => {
      chip["active-default"] = false;
    });
    // Set the selected one to true
    updatedCateChips[index]["active-default"] = true;
    onChange(updatedCateChips);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          {editingIndex !== null ? 'Chỉnh sửa CateChip' : 'Thêm CateChip mới'}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID *
            </label>
            <input
              type="text"
              value={newCateChip.id}
              onChange={(e) => setNewCateChip({ ...newCateChip, id: e.target.value })}
              placeholder="Ví dụ: truyen-chu"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên *
            </label>
            <input
              type="text"
              value={newCateChip.name}
              onChange={(e) => setNewCateChip({ ...newCateChip, name: e.target.value })}
              placeholder="Ví dụ: Truyện Chữ"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <input
              type="text"
              value={newCateChip.description}
              onChange={(e) => setNewCateChip({ ...newCateChip, description: e.target.value })}
              placeholder="Mô tả về cateChip này"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <input
              type="text"
              value={newCateChip.type || ''}
              onChange={(e) => setNewCateChip({ ...newCateChip, type: e.target.value })}
              placeholder="Ví dụ: novel, manga, audio, video"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Path
            </label>
            <input
              type="text"
              value={newCateChip["api-path"]}
              onChange={(e) => setNewCateChip({ ...newCateChip, "api-path": e.target.value })}
              placeholder="Ví dụ: /api/novel-vn"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              id="active-default"
              checked={newCateChip["active-default"] || false}
              onChange={(e) => setNewCateChip({ ...newCateChip, "active-default": e.target.checked })}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="active-default" className="ml-2 block text-sm text-gray-700">
              Active Default API
            </label>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={addOrUpdateCateChip}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            {editingIndex !== null ? 'Cập nhật' : 'Thêm'}
          </button>
          
          {editingIndex !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-900">Danh sách CateChip</h4>
        
        {cateChips.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Chưa có cateChip nào
          </div>
        ) : (
          <div className="space-y-2">
            {cateChips.map((cateChip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-md p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {cateChip.id}
                      </span>
                      <span className="font-medium">{cateChip.name}</span>
                      {cateChip.type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cateChip.type}
                        </span>
                      )}
                      {cateChip["active-default"] && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      )}
                    </div>
                    {cateChip.description && (
                      <p className="mt-1 text-sm text-gray-600">{cateChip.description}</p>
                    )}
                    {cateChip["api-path"] && (
                      <p className="mt-1 text-xs text-gray-500 font-mono">{cateChip["api-path"]}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => toggleActiveDefault(index)}
                      className={`p-1 rounded ${cateChip["active-default"] ? 'text-green-600 hover:text-green-900' : 'text-gray-400 hover:text-gray-600'}`}
                      title={cateChip["active-default"] ? "Active Default" : "Set as Active Default"}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editCateChip(index)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCateChip(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}