import { message } from 'antd';
import { useEffect, useState } from 'react';
import { checkInOut } from '../services/api';
import { useProfile } from './profile';
import { useSession } from './session';

export const useCheckInOut = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const { id: sessionId } = useSession();
  const { profile: { id: profileId } = {} } = useProfile();

  useEffect(() => {
    if (!sessionId || !profileId) {
      return;
    }
    checkInOut(sessionId, profileId, true).then(() => {
      message.success('Checked in');
      setIsCheckedIn(true);
    });
    return () => {
      checkInOut(sessionId, profileId, false).then(() => {
        message.success('Checked out');
      });
    };
  }, [sessionId, profileId]);
  return isCheckedIn;
};
