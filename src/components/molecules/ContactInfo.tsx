import React, { useState } from 'react';
import { validationRegex, validationMessages } from '../../data/validationConfig';

interface ContactInfoProps {
  onContactInfoChange: (name: string, phoneNumber: string, isNameValid: boolean, isPhoneValid: boolean) => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ onContactInfoChange }) => {
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>('+94'); // Default country code, now editable
  const [localPhoneNumber, setLocalPhoneNumber] = useState<string>('');
  const [countryCodeError, setCountryCodeError] = useState<string | null>(null);
  const [isNameTouched, setIsNameTouched] = useState<boolean>(false);
  const [isCountryCodeTouched, setIsCountryCodeTouched] = useState<boolean>(false);
  const [isLocalPhoneNumberTouched, setIsLocalPhoneNumberTouched] = useState<boolean>(false);

  const validateName = (name: string): boolean => {
    if (name.trim() === '') {
      setNameError(validationMessages.name.empty);
      return false;
    }
    if (!validationRegex.name.test(name)) {
      setNameError(validationMessages.name.invalid);
      return false;
    }
    setNameError(null);
    return true;
  };

  const validateCountryCode = (code: string): boolean => {
    if (code.trim() === '') {
      setCountryCodeError(validationMessages.countryCode.empty);
      return false;
    }
    if (!validationRegex.countryCode.test(code)) {
      setCountryCodeError(validationMessages.countryCode.invalid);
      return false;
    }
    setCountryCodeError(null);
    return true;
  };

  const validateLocalPhoneNumber = (phone: string): boolean => {
    if (phone.trim() === '') {
      setPhoneNumberError(validationMessages.phoneNumber.empty);
      return false;
    }
    if (!validationRegex.localPhoneNumber.test(phone)) {
      setPhoneNumberError(validationMessages.phoneNumber.invalid);
      return false;
    }
    setPhoneNumberError(null);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setIsNameTouched(true);
    const isNameValid = validateName(newName);
    const isLocalPhoneValid = validateLocalPhoneNumber(localPhoneNumber);
    const isCountryCodeValid = validateCountryCode(countryCode);
    onContactInfoChange(newName, countryCode + localPhoneNumber, isNameValid, isLocalPhoneValid && isCountryCodeValid);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCountryCode = e.target.value;
    setCountryCode(newCountryCode);
    setIsCountryCodeTouched(true);
    const isCountryCodeValid = validateCountryCode(newCountryCode);
    const isNameValid = validateName(name);
    const isLocalPhoneValid = validateLocalPhoneNumber(localPhoneNumber);
    onContactInfoChange(name, newCountryCode + localPhoneNumber, isNameValid, isLocalPhoneValid && isCountryCodeValid);
  };

  const handleLocalPhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocalPhoneNumber = e.target.value;
    setLocalPhoneNumber(newLocalPhoneNumber);
    setIsLocalPhoneNumberTouched(true);
    const isLocalPhoneValid = validateLocalPhoneNumber(newLocalPhoneNumber);
    const isNameValid = validateName(name);
    const isCountryCodeValid = validateCountryCode(countryCode);
    onContactInfoChange(name, countryCode + newLocalPhoneNumber, isNameValid, isLocalPhoneValid && isCountryCodeValid);
  };

  React.useEffect(() => {
    const isNameValid = validateName(name);
    const isCountryCodeValid = validateCountryCode(countryCode);
    const isLocalPhoneValid = validateLocalPhoneNumber(localPhoneNumber);
    onContactInfoChange(name, countryCode + localPhoneNumber, isNameValid, isLocalPhoneValid && isCountryCodeValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, localPhoneNumber, countryCode]);

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label>
        <input
          type="text"
          id="name"
          className="appearance-none border-2 border-input rounded-lg p-3 w-full h-12 text-lg text-foreground placeholder-muted-foreground bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g., John Doe"
          value={name}
          onChange={handleNameChange}
          onBlur={() => setIsNameTouched(true)}
        />
        {isNameTouched && nameError && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{nameError}</p>}
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground">Phone Number</label>
        <div className="flex items-center space-x-2">
          <input
            type="tel"
            id="countryCode"
            className="flex-shrink-0 appearance-none border-2 border-input rounded-lg p-3 w-20 h-12 text-lg text-foreground placeholder-muted-foreground bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="+1"
            value={countryCode}
            onChange={handleCountryCodeChange}
            onBlur={() => setIsCountryCodeTouched(true)}
            pattern="^\+[1-9]\d{0,3}$"
          />
          <input
            type="tel"
            id="localPhoneNumber"
            className="appearance-none border-2 border-input rounded-lg p-3 w-full h-12 text-lg text-foreground placeholder-muted-foreground bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g., 5551234567"
            value={localPhoneNumber}
            onChange={handleLocalPhoneNumberChange}
            onBlur={() => setIsLocalPhoneNumberTouched(true)}
            pattern="[0-9]*"
          />
        </div>
        {isCountryCodeTouched && countryCodeError && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{countryCodeError}</p>}
        {isLocalPhoneNumberTouched && phoneNumberError && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{phoneNumberError}</p>}
      </div>
    </div>
  );
};

export default ContactInfo;
