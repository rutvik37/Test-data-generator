import React from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { SchemaField, SetSchema } from '../types';

const DATA_TYPES: string[] = [
  'String', 'Number', 'Boolean', 'UUID',
  'First Name', 'Last Name', 'Full Name',
  'Email', 'Phone', 'Address', 'City',
  'Country', 'Zip Code', 'Company', 'Job Title',
  'Date (Past)', 'Date (Future)', 'Price',
  'Product Name', 'Product Category',
  'Username', 'Password',
];

interface SchemaBuilderProps {
  schema: SchemaField[];
  setSchema: SetSchema;
}

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ schema, setSchema }) => {
  const addField = (): void => {
    setSchema([...schema, { name: '', type: 'String' }]);
  };

  const resetSchema = (): void => {
    setSchema([{ name: '', type: 'String' }]);
  };

  const updateField = (index: number, key: keyof SchemaField, value: string): void => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], [key]: value };
    setSchema(newSchema);
  };

  const removeField = (index: number): void => {
    const newSchema = schema.filter((_, i) => i !== index);
    setSchema(newSchema);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Schema Definition</h2>

      {schema.map((field, index) => (
        <div key={index} className="flex items-center gap-3 mb-4 w-full">
          <input
            type="text"
            placeholder="Field Name"
            value={field.name}
            onChange={(e) => updateField(index, 'name', e.target.value)}
            className="flex-1 w-full min-w-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={field.type}
            onChange={(e) => updateField(index, 'type', e.target.value)}
            className="flex-1 w-full min-w-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DATA_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            onClick={() => removeField(index)}
            className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Remove Field"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-6 mt-4">
        <button
          onClick={addField}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          <Plus size={18} /> Add Field
        </button>
      </div>
    </div>
  );
};

export default SchemaBuilder;
