import React, { useState, useEffect } from 'react';
// Sidebar bileşenini kaldırıyorum çünkü AppLayout içinde zaten var
// import { Sidebar } from '@/layouts/sidebar';
import AnalyticsCard from '@/features/analytics/AnalyticsCard';

const Analytics = () => {
  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Analiz Paneli</h1>
        </div>

        <AnalyticsCard />
      </div>
    </main>
  );
};

export default Analytics;
