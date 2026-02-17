import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../../../../middle-layer/types/User';
import { getAppStore } from '../../../external/bcanSatchel/store';
import '../styles/UserDropdown.css';

interface UserDropdownProps {
  selectedUser: { name: string; email: string } | null;
  // Might be worth combining first and last into one fieldto display
  onSelect: (user: { firstName: string; lastName : string; email: string }) => void;
  placeholder?: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  selectedUser, 
  onSelect,
  placeholder = "Select a user"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const store = getAppStore();
  const activeUsers = store.activeUsers || [];

  // Filter users based on search
  const filteredUsers = activeUsers.filter((user: User) =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user: User) => {
    onSelect({ firstName: user.firstName,lastName:user.lastName, email: user.email });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="user-dropdown-container">
      {/* Input field that opens dropdown */}
      <input
        className="user-dropdown-input"
        placeholder={placeholder}
        value={selectedUser ? selectedUser.name : searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        readOnly={!!selectedUser}
      />

      {/* Dropdown menu */}
      {isOpen && (
        <div className="user-dropdown-menu">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user: User) => (
              <div
                key={user.email}
                onClick={() => handleUserSelect(user)}
                className="user-dropdown-item"
              >
                <div className="user-dropdown-name">{user.firstName} {user.lastName}</div>
                <div className="user-dropdown-email">{user.email}</div>
              </div>
            ))
          ) : (
            <div className="user-dropdown-empty">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;