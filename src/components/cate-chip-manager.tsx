'use client';

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from 'lucide-react';
import { TextConstants } from '@/lib/text-constants';

interface CateChip {
  id: string;
  name: string;
  description: string;
  "api-path": string;
  "active-default"?: boolean;
  type?: string;
  lang?: string; // Make language property optional
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
    type: '',
    lang: '' // Add language field
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addOrUpdateCateChip = () => {
    if (newCateChip.id.trim() && newCateChip.name.trim()) {
      const updatedCateChips = [...cateChips];
      
      // Add lang property if it's not empty
      const chipToAddOrUpdate: CateChip = { ...newCateChip };
      if (!chipToAddOrUpdate.lang) {
        delete chipToAddOrUpdate['lang'];
      }
      
      if (editingIndex !== null) {
        // Update existing
        updatedCateChips[editingIndex] = chipToAddOrUpdate;
        setEditingIndex(null);
      } else {
        // Add new
        if (!cateChips.some(chip => chip.id === newCateChip.id)) {
          updatedCateChips.push(chipToAddOrUpdate);
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
    const chipToEdit: CateChip = { ...cateChips[index] };
    // Ensure lang property exists
    if (!chipToEdit.lang) {
      chipToEdit.lang = '';
    }
    
    setNewCateChip(chipToEdit as any);
    setEditingIndex(index);
  };

  const resetForm = () => {
    setNewCateChip({
      id: '',
      name: '',
      description: '',
      "api-path": '',
      "active-default": false,
      type: '',
      lang: '' // Reset language field
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
          {editingIndex !== null ? TextConstants.category.manager.edit_title.vi : TextConstants.category.manager.add_title.vi}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TextConstants.category.manager.id_label.vi}
            </label>
            <input
              type="text"
              value={newCateChip.id}
              onChange={(e) => setNewCateChip({ ...newCateChip, id: e.target.value })}
              placeholder={TextConstants.category.manager.id_placeholder.vi}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TextConstants.category.manager.name_label.vi}
            </label>
            <input
              type="text"
              value={newCateChip.name}
              onChange={(e) => setNewCateChip({ ...newCateChip, name: e.target.value })}
              placeholder={TextConstants.category.manager.name_placeholder.vi}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TextConstants.category.manager.description_label.vi}
            </label>
            <input
              type="text"
              value={newCateChip.description}
              onChange={(e) => setNewCateChip({ ...newCateChip, description: e.target.value })}
              placeholder={TextConstants.category.manager.description_placeholder.vi}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TextConstants.category.manager.type_label.vi}
            </label>
            <input
              type="text"
              value={newCateChip.type || ''}
              onChange={(e) => setNewCateChip({ ...newCateChip, type: e.target.value })}
              placeholder={TextConstants.category.manager.type_placeholder.vi}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TextConstants.category.manager.language_label.vi}
            </label>
            <input
              type="text"
              value={newCateChip.lang || ''}
              onChange={(e) => setNewCateChip({ ...newCateChip, lang: e.target.value })}
              placeholder={TextConstants.category.manager.language_placeholder.vi}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TextConstants.category.manager.api_path_label.vi}
            </label>
            <input
              type="text"
              value={newCateChip["api-path"]}
              onChange={(e) => setNewCateChip({ ...newCateChip, "api-path": e.target.value })}
              placeholder={TextConstants.category.manager.api_path_placeholder.vi}
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
              {TextConstants.category.manager.active_default_label.vi}
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
                      {cateChip.lang && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {cateChip.lang}
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