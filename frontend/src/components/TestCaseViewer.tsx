import React from 'react';
import { Download } from 'lucide-react';
import { TestCase, TestCaseResult } from '../types';

interface TestCaseViewerProps {
  testCases: TestCaseResult | null;
  onReset: () => void;
}

const TestCaseViewer: React.FC<TestCaseViewerProps> = ({ testCases, onReset }) => {
  if (!testCases) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <p className="text-gray-500 dark:text-gray-400">No test cases generated yet. Click "Generate Test Cases".</p>
      </div>
    );
  }

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Category,Field,Title,Steps,Expected Result\\n';
    
    const appendCases = (category: string, cases: TestCase[]) => {
      cases.forEach((tc) => {
        const row = [
          category,
          `"${tc.field.replace(/"/g, '""')}"`,
          `"${tc.title.replace(/"/g, '""')}"`,
          tc.steps ? `"${tc.steps.replace(/"/g, '""')}"` : '""',
          tc.expectedResult ? `"${tc.expectedResult.replace(/"/g, '""')}"` : '""'
        ].join(',');
        csvContent += row + '\n';
      });
    };

    appendCases('Positive', testCases.positive);
    appendCases('Negative', testCases.negative);
    appendCases('Edge', testCases.edge);

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'test_cases.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(testCases, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'test_cases.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderGroup = (title: string, cases: TestCase[], colorClass: string, bgClass: string) => {
    if (cases.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${colorClass}`}>
          <div className={`w-3 h-3 rounded-full ${bgClass}`}></div>
          {title} ({cases.length})
        </h3>
        <div className="space-y-3">
          {cases.map((tc) => (
            <div key={tc.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{tc.title}</div>
              {tc.steps && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Steps:</span> {tc.steps}
                </div>
              )}
              {tc.expectedResult && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span> {tc.expectedResult}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Test Cases</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
          >
            <Download size={16} /> CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
          >
            <Download size={16} /> JSON
          </button>
          <button
            onClick={onReset}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline px-2"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto pr-2 pb-4">
        {renderGroup('Positive Test Cases', testCases.positive, 'text-green-600 dark:text-green-400', 'bg-green-500')}
        {renderGroup('Negative Test Cases', testCases.negative, 'text-red-600 dark:text-red-400', 'bg-red-500')}
        {renderGroup('Edge Test Cases', testCases.edge, 'text-amber-600 dark:text-amber-400', 'bg-amber-500')}
      </div>
    </div>
  );
};

export default TestCaseViewer;
