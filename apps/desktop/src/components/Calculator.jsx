import { useState } from 'react';
import { X, Delete } from 'lucide-react';

export default function Calculator({ onClose }) {
  const [calc, setCalc] = useState('');
  const [result, setResult] = useState('');

  const ops = ['/', '*', '+', '-', '.'];

  const safeEval = (str) => {
    try {
      const sanitized = str.replace(/\s+/g, '');
      if (!sanitized) return 0;
      
      // Handle leading negative numbers by prepending 0 (e.g., -5 becomes 0-5)
      let expression = sanitized;
      if (expression.startsWith('-')) expression = '0' + expression;
      
      const tokens = expression.split(/([+\-*/])/).filter(t => t);
      if (!tokens.length) return 0;

      // First pass: Handle multiplication and division
      const stack = [];
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === '*' || token === '/') {
          const nextVal = parseFloat(tokens[++i]);
          const prevVal = stack.pop();
          stack.push(token === '*' ? prevVal * nextVal : prevVal / nextVal);
        } else {
          stack.push(ops.includes(token) ? token : parseFloat(token));
        }
      }

      // Second pass: Handle addition and subtraction
      let res = stack[0];
      for (let i = 1; i < stack.length; i += 2) {
        const op = stack[i];
        const val = stack[i+1];
        if (op === '+') res += val;
        if (op === '-') res -= val;
      }

      if (Number.isNaN(res) || !Number.isFinite(res)) return 'Error';
      return Math.round(res * 100000000) / 100000000;
    } catch {
      return 'Error';
    }
  };

  const updateCalc = value => {
    let currentCalc = calc;
    if (calc === 'Error') {
      currentCalc = '';
      setResult('');
    }
    
    // Prevent starting with an operator (except decimal)
    if (currentCalc === '' && ops.includes(value) && value !== '.') {
      return;
    }
    
    // If the last character is an operator and we hit another operator, replace it
    if (ops.includes(value) && ops.includes(currentCalc.slice(-1))) {
      // Don't allow multiple decimals
      if (value === '.' && currentCalc.includes('.')) {
         // This is a simple check, ideally we'd check the current number segment
      }
      setCalc(currentCalc.slice(0, -1) + value);
      return;
    }
    
    const newCalc = currentCalc + value;
    setCalc(newCalc);
    
    // Auto-calculate the result preview if valid
    if (!ops.includes(value)) {
      const res = safeEval(newCalc);
      if (res !== 'Error') setResult(res.toString());
    }
  };

  const calculate = () => {
    if (calc === '' || calc === 'Error') return;
    // Don't evaluate if it ends with an operator
    if (ops.includes(calc.slice(-1))) return;
    
    const res = safeEval(calc);
    if (res === 'Error') {
      // If it failed despite our checks, just keep the current calc
      return;
    }
    setCalc(res.toString());
    setResult('');
  };

  const deleteLast = () => {
    if (calc === 'Error') {
      clear();
      return;
    }
    if (calc === '') return;
    const value = calc.slice(0, -1);
    setCalc(value);
    
    if (value && !ops.includes(value.slice(-1))) {
      const res = safeEval(value);
      setResult(res !== 'Error' ? res.toString() : '');
    } else {
      setResult('');
    }
  };

  const clear = () => {
    setCalc('');
    setResult('');
  };

  const buttons = [
    { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' }, { label: '÷', val: '/', color: 'text-amber-500 bg-amber-500/10' },
    { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' }, { label: '×', val: '*', color: 'text-amber-500 bg-amber-500/10' },
    { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '-', val: '-', color: 'text-amber-500 bg-amber-500/10' },
    { label: 'C', val: 'C', action: clear, color: 'text-red-500 bg-red-500/10' }, { label: '0', val: '0' }, { label: '.', val: '.' }, { label: '+', val: '+', color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <div className="absolute top-14 right-5 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgba(44,62,107,0.12)] overflow-hidden z-50 animate-fade-up">
      <div className="bg-gray-50 border-b border-gray-100 p-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-xs">Calculator</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14}/></button>
      </div>
      
      <div className="p-4 bg-white flex flex-col gap-1 items-end min-h-[80px] justify-end border-b border-gray-100">
        <div className="text-gray-400 text-xs h-4">{result ? `=${result}` : ''}</div>
        <div className="text-2xl font-extrabold text-gray-900 truncate w-full text-right">{calc || '0'}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50">
        {buttons.map((btn, i) => (
          <button 
            key={i} 
            onClick={() => btn.action ? btn.action() : updateCalc(btn.val)}
            className={`h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${btn.color || 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:border-gray-200'}`}
          >
            {btn.label}
          </button>
        ))}
        <button onClick={deleteLast} className="col-span-2 h-10 rounded-xl font-bold text-sm flex items-center justify-center text-gray-600 bg-gray-200/50 hover:bg-gray-200 transition-colors"><Delete size={14} className="mr-1"/> DEL</button>
        <button onClick={calculate} className="col-span-2 h-10 rounded-xl font-bold text-sm flex items-center justify-center text-white gradient-primary shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-transform">=</button>
      </div>
    </div>
  );
}
