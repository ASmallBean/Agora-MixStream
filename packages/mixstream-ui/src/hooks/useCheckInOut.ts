import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkInOut } from '../services/api';
import { addCloseHandle, removeCloseHandle } from '../utils';
import { useProfile } from './profile';
import { useSession } from './session';

export const useCheckInOut = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const { id: sessionId } = useSession();
  const { profile: { id: profileId } = {} } = useProfile();
  const navigator = useNavigate();
  useEffect(() => {
    if (!sessionId || !profileId) {
      return;
    }
    checkInOut(sessionId, profileId, true)
      .then(() => {
        message.success('Checked in');
        setIsCheckedIn(true);
      })
      .catch(() => {
        navigator('/');
      });
    const handle = () => {
      console.log(111);
      checkInOut(sessionId, profileId, false);
    };
    addCloseHandle('close', handle);
    return () => {
      removeCloseHandle('close', handle);
      checkInOut(sessionId, profileId, false).then(() => {
        message.success('Checked out');
      });
    };
  }, [sessionId, profileId, navigator]);

  return isCheckedIn;
};
