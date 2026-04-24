import React, { useState } from 'react';
import { Download, Copy, FileJson, Check, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { GeneratedRecord } from '../types';

interface ExportButtonsProps {
  data: GeneratedRecord[] | null;
  onReset: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, onReset }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!data || data.length === 0) return null;

  const handleDownloadCSV = (): void => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'test_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = (): void => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'test_data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (): void => {
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-nowrap gap-2 mt-4 mb-4">
      <button
        onClick={handleDownloadCSV}
        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded shadow transition-colors whitespace-nowrap"
      >
        <Download size={16} /> Download CSV
      </button>
      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded shadow transition-colors whitespace-nowrap"
      >
        <FileJson size={16} /> Download JSON
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1.5 rounded shadow transition-colors whitespace-nowrap"
      >
        {copied ? (
          <><Check size={16} /> Copied!</>
        ) : (
          <><Copy size={16} /> Copy to Clipboard</>
        )}
      </button>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded shadow transition-colors whitespace-nowrap"
      >
        <Trash2 size={16} /> Reset Preview
      </button>
    </div>
  );
};

export default ExportButtons;
