import React from 'react';
import { SchemaField, Template, SetSchema } from '../types';

const TEMPLATES: Template[] = [
  {
    name: 'User Profile',
    schema: [
      { name: 'id', type: 'UUID' },
      { name: 'fullName', type: 'Full Name' },
      { name: 'email', type: 'Email' },
      { name: 'phone', type: 'Phone' },
    ],
  },
  {
    name: 'E-commerce',
    schema: [
      { name: 'productId', type: 'UUID' },
      { name: 'productName', type: 'Product Name' },
      { name: 'category', type: 'Product Category' },
      { name: 'price', type: 'Price' },
    ],
  },
  {
    name: 'Login Data',
    schema: [
      { name: 'userId', type: 'UUID' },
      { name: 'username', type: 'Username' },
      { name: 'password', type: 'Password' },
    ],
  },
  {
    name: 'Company Directory',
    schema: [
      { name: 'empId', type: 'UUID' },
      { name: 'fullName', type: 'Full Name' },
      { name: 'company', type: 'Company' },
      { name: 'title', type: 'Job Title' },
      { name: 'email', type: 'Email' },
    ],
  },
  {
    name: 'Location Data',
    schema: [
      { name: 'locId', type: 'UUID' },
      { name: 'address', type: 'Address' },
      { name: 'city', type: 'City' },
      { name: 'country', type: 'Country' },
      { name: 'zip', type: 'Zip Code' },
    ],
  },
  {
    name: 'Event Registration',
    schema: [
      { name: 'ticketId', type: 'UUID' },
      { name: 'attendee', type: 'Full Name' },
      { name: 'eventDate', type: 'Date (Future)' },
      { name: 'phone', type: 'Phone' },
    ],
  },
];

interface TemplateSelectorProps {
  setSchema: SetSchema;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ setSchema }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
        Quick Templates
      </h3>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.name}
            onClick={() => setSchema(template.schema)}
            className="px-3 py-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
