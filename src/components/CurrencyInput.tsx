'use client'

// src/components/CurrencyInput.tsx
import CurrencyInputField from 'react-currency-input-field';
import { useLanguage } from '../contexts/LanguageContext';

interface CurrencyInputProps {
  value: string;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  decimalsLimit?: number;
  decimalScale?: number;
  suffix?: string; 
  prefix?: string; 
  disabled?: boolean;
}

export function CurrencyInput({ 
  value, 
  onValueChange, 
  placeholder, 
  className, 
  readOnly = false,
  decimalsLimit = 2,
  decimalScale = 2,
  suffix = "",
  prefix = "",
}: CurrencyInputProps) {
  const { currentLanguage } = useLanguage();

  const handleValueChange = (value: string | undefined) => {
    if (onValueChange) {
      // Convert Russian decimal format to standard format for calculations
      let formattedValue = value;
      if (currentLanguage === 'ru' && value) {
        formattedValue = value.replace(',', '.');
      }
      onValueChange(formattedValue);
    }
  };

  // Convert value back to Russian format for display
  const displayValue = currentLanguage === 'ru' && value ? value.replace('.', ',') : value;

  return (
    <CurrencyInputField
      value={displayValue} // Use the display-formatted value
      onValueChange={readOnly ? undefined : handleValueChange}
      placeholder={placeholder}
      decimalsLimit={decimalsLimit}
      decimalScale={decimalScale}
      // Russian format
      decimalSeparator={currentLanguage === 'ru' ? ',' : '.'}
      groupSeparator={currentLanguage === 'ru' ? ' ' : ','}
      allowNegativeValue={false}
      disabled={readOnly}
      suffix={suffix} 
      prefix={prefix}
      className={`${className} ${readOnly ? 'cursor-default' : ''}`}
    />
  );
}