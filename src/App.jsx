import React, { useState, useEffect, useMemo } from 'react';
import { fetchWages } from './services/wageService';

// --- 1. 模拟 Mock API ---
// 已迁移至 services/wageService.js

// --- 2. 辅助工具函数 ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); 
const formatDateKey = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// 读取指定 cookie 值的工具函数
const getCookie = (key) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const getQueryParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  const v = params.get(key);
  return v ? decodeURIComponent(v) : null;
};

// --- 3. 组件部分 ---
function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ userName: '', records: [] });
  // 默认查看2023年12月
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); 

  useEffect(() => {
    const userName = getQueryParam('name'); // 改为从 URL 获取

    if (!userName) {
      console.error('Missing required userName in URL query: name');
      setLoading(false);
      setData(prev => ({ ...prev, userName: '' }));
      return;
    }

    fetchWages(userName).then((data) => {
      setData(data);
      setLoading(false);
    }).catch((error) => {
      console.error("Failed to load wages:", error);
      setLoading(false);
    });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 

  const { daysArray, monthlyTotal } = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const wageMap = {}; 
    let total = 0;
    
    data.records.forEach(item => {
      const wage = item.wage == null ? 0 : Number(item.wage) || 0;
      wageMap[item.date] = wage;
      const [rYear, rMonth] = item.date.split('-').map(Number);
      if (rYear === year && rMonth === month + 1) {
        total += wage;
      }
    });

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateKey = formatDateKey(year, month, day);
      return {
        day,
        dateKey,
        wage: wageMap[dateKey] || 0
      };
    });

    return { daysArray: [...blanks, ...days], monthlyTotal: total };
  }, [currentDate, data]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  if (loading) return <div style={styles.loading}>数据加载中...</div>;

  return (
    <div style={styles.container}>
      {/* 顶部：用户信息与汇总 */}
      <div style={styles.headerCard}>
        <h2 style={styles.userName}>{data.userName} 的工资单</h2>
        <div style={styles.totalContainer}>
          <span style={styles.totalLabel}>{year}年{month + 1}月 总收入</span>
          <span style={styles.totalAmount}>¥ {monthlyTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* 控制条：切换月份 */}
      <div style={styles.controlBar}>
        <button onClick={() => changeMonth(-1)} style={styles.navBtn}>&lt; 上月</button>
        <span style={styles.currentDateDisplay}>{year}年 {month + 1}月</span>
        <button onClick={() => changeMonth(1)} style={styles.navBtn}>下月 &gt;</button>
      </div>

      {/* 日历主体 */}
      <div style={styles.calendar}>
        <div style={styles.weekRow}>
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} style={styles.weekCell}>{d}</div>
          ))}
        </div>
        
        <div style={styles.daysGrid}>
          {daysArray.map((item, index) => {
            if (!item) return <div key={`blank-${index}`} style={styles.dayCellEmpty} />;
            
            const hasWage = item.wage > 0;
            return (
              <div key={item.day} style={styles.dayCell}>
                <div style={styles.dayCellContent}>
                  <span style={styles.dayNumber}>{item.day}</span>
                  {hasWage ? (
                    <span style={styles.wageAmount}>+{item.wage}</span>
                  ) : (
                    <span style={styles.noWage}>-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- 4. 样式 ---
const styles = {
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    padding: '16px',
    boxSizing: 'border-box',
  },
  loading: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    borderRadius: '16px', padding: '20px', color: 'white',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', marginBottom: '20px',
  },
  userName: { margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'normal', opacity: 0.9 },
  totalContainer: { display: 'flex', flexDirection: 'column' },
  totalLabel: { fontSize: '14px', opacity: 0.8, marginBottom: '4px' },
  totalAmount: { fontSize: '32px', fontWeight: 'bold' },
  controlBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', padding: '0 8px',
  },
  navBtn: {
    background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
    padding: '8px 16px', fontSize: '14px', color: '#374151', cursor: 'pointer',
  },
  currentDateDisplay: { fontSize: '18px', fontWeight: '600', color: '#1f2937' },
  calendar: {
    backgroundColor: 'white', borderRadius: '16px', padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  weekRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(7, 1fr)', 
    gap: '8px',  // 与 daysGrid 保持一致
    marginBottom: '8px' 
  },
  weekCell: { 
    textAlign: 'center', 
    fontSize: '14px', 
    color: '#9ca3af', 
    paddingBottom: '8px',
    boxSizing: 'border-box',
  },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  dayCell: {
    // 使用 padding-bottom 替代 aspectRatio 以兼容 iOS
    position: 'relative',
    width: '100%',
    paddingBottom: '100%', // 创建 1:1 的正方形
    backgroundColor: '#f9fafb',
    borderRadius: '8px', 
    border: '1px solid #f3f4f6',
    boxSizing: 'border-box',
  },
  dayCellContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellEmpty: { 
    width: '100%',
    paddingBottom: '100%', // 与 dayCell 保持一致的比例
  },
  dayNumber: { fontSize: '14px', color: '#374151', fontWeight: '500', marginBottom: '2px' },
  wageAmount: { fontSize: '12px', color: '#10b981', fontWeight: '600' },
  noWage: { fontSize: '12px', color: '#d1d5db' }
};

export default App;