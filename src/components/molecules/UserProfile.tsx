import React from 'react';
import Avatar from '../atoms/Avatar';

interface UserProfileProps {
  userName: string;
  avatarUrl: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, avatarUrl }) => {
  return (
    <div className="flex items-center gap-4">
      <span className="hidden sm:block font-medium text-gray-800">{userName}</span>
      <Avatar src={avatarUrl} alt={`Avatar de ${userName}`} />
    </div>
  );
};

export default UserProfile;