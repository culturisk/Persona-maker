'use client';

import { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFieldError } from '@/lib/validation';

export function FormField({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  rules = [], 
  placeholder = '', 
  options = [],
  rows = 3,
  className = '',
  disabled = false,
  ...props 
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = useCallback((newValue) => {
    const fieldError = getFieldError(newValue, rules);
    setError(fieldError);
    onChange(newValue);
  }, [onChange, rules]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    const fieldError = getFieldError(value, rules);
    setError(fieldError);
  }, [value, rules]);

  const showError = touched && error;

  const commonProps = {
    id,
    value: value || '',
    disabled,
    onBlur: handleBlur,
    className: `${className} ${showError ? 'border-destructive' : ''}`,
    ...props
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={rows}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger className={showError ? 'border-destructive' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type={type}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={showError ? 'text-destructive' : ''}>
        {label}
        {rules.some(r => r.required) && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderInput()}
      {showError && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}