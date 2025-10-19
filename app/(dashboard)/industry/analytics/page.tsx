"use client";
import SalesChart from '@/components/dashboard/SalesChart/SalesChart';
import styles from './analytics.module.css';
import CardData from '@/components/dashboard/CardData/CardData';
import { BiCartAlt, BiDollar, BiLineChart, BiBasket } from 'react-icons/bi';
import { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import BottomNav from '@/components/layout/BottomNav/BottomNav';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface TableRow {
  id: number;
  date: string;
  retailer: string;
  product: string;
  quantity: number;
  total: number;
}

const initialData: TableRow[] = [
  { id: 1, date: '2025-09-01', retailer: 'Fábrica A', product: 'Widget A', quantity: 10, total: 120 },
  { id: 2, date: '2025-09-02', retailer: 'Fábrica B', product: 'Widget B', quantity: 5, total: 60 },
  { id: 3, date: '2025-09-03', retailer: 'Fábrica C', product: 'Widget A', quantity: 8, total: 96 },
  { id: 4, date: '2025-09-03', retailer: 'Fábrica E', product: 'Widget D', quantity: 12, total: 125 },
  { id: 5, date: '2025-09-05', retailer: 'Fábrica A', product: 'Widget C', quantity: 11, total: 110 },
  { id: 6, date: '2025-09-01', retailer: 'Fábrica A', product: 'Widget A', quantity: 5, total: 60 },
  { id: 7, date: '2025-09-02', retailer: 'Fábrica B', product: 'Widget D', quantity: 16, total: 150 },
  { id: 8, date: '2025-09-03', retailer: 'Fábrica C', product: 'Widget A', quantity: 8, total: 96 },
  { id: 9, date: '2025-09-03', retailer: 'Fábrica B', product: 'Widget D', quantity: 14, total: 130 },
  { id: 10, date: '2025-09-05', retailer: 'Fábrica E', product: 'Widget C', quantity: 14, total: 110 },
];

export default function IndustryAnalytics() {

  return (
    <div className={styles.fullBg}>

    </div>
  );
}