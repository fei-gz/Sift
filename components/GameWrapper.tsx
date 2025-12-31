
import React from 'react';
import { useGyro } from '../hooks/useGyro';

const GameWrapper: React.FC<{ children: React.ReactNode, active: boolean }> = ({ children, active }) => {
  useGyro(active);
  return <>{children}</>;
};

export default GameWrapper;
