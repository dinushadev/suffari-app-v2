import React, { useState } from 'react';

interface ContactInfoProps {
  onContactInfoChange: (name: string, phoneNumber: string) => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ onContactInfoChange }) => {
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onContactInfoChange(newName, phoneNumber);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    onContactInfoChange(name, newPhoneNumber);
  };

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          className="appearance-none border-2 border-input rounded-lg p-3 w-full h-12 text-lg text-foreground placeholder-muted-foreground bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter name"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          className="appearance-none border-2 border-input rounded-lg p-3 w-full h-12 text-lg text-foreground placeholder-muted-foreground bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
      </div>
    </div>
  );
};

export default ContactInfo;
