import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const ProcessTransaction = () => {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");

  // Fetch CSV options
  useEffect(() => {
    Papa.parse('/options.csv', {
      download: true,
      header: true,
      complete: (results: any) => {
        const optionList = results.data.map((row: any) => row.option); // Adjust 'option' to match your CSV header
        setOptions(optionList);
      },
      error: (error: any) => {
        console.error("Error reading CSV:", error);
      }
    });
  }, []);

  return (
    <div className="text-center">
      <h2 className="mb-4">Select an Option</h2>
      <select
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
        className="border rounded p-2"
      >
        <option value="" disabled>Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
      {selectedOption && <div className="mt-2">You selected: {selectedOption}</div>}
    </div>
  );
};

export default ProcessTransaction;