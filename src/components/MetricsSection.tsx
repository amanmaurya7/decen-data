
import React from 'react';
import MetricsCard from './MetricsCard';
import { File, Folder, Lock } from "lucide-react";

interface MetricsSectionProps {
  totalFiles: number;
  totalStorage: number;
}

export const MetricsSection = ({ totalFiles, totalStorage }: MetricsSectionProps) => {
  const formattedStorage = (totalStorage / (1024 * 1024)).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <MetricsCard 
        title="Total Files" 
        value={totalFiles} 
        description="Securely stored files"
        icon={<File className="h-4 w-4" />} 
      />
      <MetricsCard 
        title="Storage Used" 
        value={`${formattedStorage} MB`} 
        description="Encrypted storage space"
        icon={<Folder className="h-4 w-4" />} 
      />
      <MetricsCard 
        title="Security Status" 
        value="Encrypted" 
        description="End-to-end encryption"
        icon={<Lock className="h-4 w-4" />} 
        className="bg-gradient-to-br from-blockchain-darkBlue to-blockchain-purple/30"
      />
    </div>
  );
};
