import React, { createContext, useContext, useState, useEffect } from 'react';
import { HoldStatus } from '../types';

interface StudentContextType {
  studentId: string;
  setStudentId: (id: string) => void;
  isValidStudentId: boolean;
  activeHoldId: string | null;
  activeHoldStatus: HoldStatus | null;
  setActiveHoldId: (id: string | null) => void;
  setActiveHoldStatus: (status: HoldStatus | null) => void;
  clearStudent: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STUDENT_ID_KEY = 'school_admission_student_id';
const ACTIVE_HOLD_ID_KEY = 'school_admission_active_hold_id';
const ACTIVE_HOLD_STATUS_KEY = 'school_admission_active_hold_status';

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentId, setStudentIdState] = useState<string>(() => {
    return localStorage.getItem(STUDENT_ID_KEY) || '';
  });

  const [activeHoldId, setActiveHoldIdState] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_HOLD_ID_KEY) || null;
  });

  const [activeHoldStatus, setActiveHoldStatusState] = useState<HoldStatus | null>(() => {
    return (localStorage.getItem(ACTIVE_HOLD_STATUS_KEY) as HoldStatus) || null;
  });

  const isValidStudentId = /^\d{17}$/.test(studentId.trim());

  const setStudentId = (id: string) => {
    const trimmed = id.trim();
    setStudentIdState(trimmed);
    if (trimmed) {
      localStorage.setItem(STUDENT_ID_KEY, trimmed);
    } else {
      localStorage.removeItem(STUDENT_ID_KEY);
    }
  };

  const setActiveHoldId = (id: string | null) => {
    setActiveHoldIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_HOLD_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_HOLD_ID_KEY);
      localStorage.removeItem(ACTIVE_HOLD_STATUS_KEY);
      setActiveHoldStatusState(null);
    }
  };

  const setActiveHoldStatus = (status: HoldStatus | null) => {
    setActiveHoldStatusState(status);
    if (status) {
      localStorage.setItem(ACTIVE_HOLD_STATUS_KEY, status);
    } else {
      localStorage.removeItem(ACTIVE_HOLD_STATUS_KEY);
    }
  };

  const clearStudent = () => {
    setStudentId('');
    setActiveHoldId(null);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STUDENT_ID_KEY) {
        setStudentIdState(e.newValue || '');
      } else if (e.key === ACTIVE_HOLD_ID_KEY) {
        setActiveHoldIdState(e.newValue || null);
      } else if (e.key === ACTIVE_HOLD_STATUS_KEY) {
        setActiveHoldStatusState((e.newValue as HoldStatus) || null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <StudentContext.Provider
      value={{
        studentId,
        setStudentId,
        isValidStudentId,
        activeHoldId,
        activeHoldStatus,
        setActiveHoldId,
        setActiveHoldStatus,
        clearStudent,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
