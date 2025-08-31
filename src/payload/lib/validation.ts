// src/payload/lib/validation.ts
import type { FieldHook } from 'payload';

export const customerSchemas = {
  emailValidation: (value: string) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  },

  phoneValidation: (value: string) => {
    if (!value) return true;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) || 'Please enter a valid phone number';
  },

  nameValidation: (value: string) => {
    if (!value) return true;
    return value.length >= 2 || 'Name must be at least 2 characters long';
  },

  postalCodeValidation: (value: string) => {
    if (!value) return true;
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadianPostalRegex.test(value) || 'Please enter a valid Canadian postal code';
  },
};

export const emailValidationHook = ({ value }: { value: any }) => {
  return customerSchemas.emailValidation(value as string);
};

export const phoneValidationHook = ({ value }: { value: any }) => {
  return customerSchemas.phoneValidation(value as string);
};

export const nameValidationHook = ({ value }: { value: any }) => {
  return customerSchemas.nameValidation(value as string);
};

export const postalCodeValidationHook = ({ value }: { value: any }) => {
  return customerSchemas.postalCodeValidation(value as string);
};
