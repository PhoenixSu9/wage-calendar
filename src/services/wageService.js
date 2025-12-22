/**
 * 获取工资单数据
 * @returns {Promise<{userName: string, records: Array<{date: string, amount: number}>}>}
 */
export const fetchWages = async () => {
  try {
    const response = await fetch('/api/wages');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (result.code === 200) {
      return result.data;
    } else {
      throw new Error(result.message || '获取数据失败');
    }
  } catch (error) {
    console.error("Failed to fetch wages:", error);
    // 在没有真实后端的情况下，为了演示不报错，这里可以暂时返回之前的 Mock 数据
    // 如果对接真实接口，请删除下方的 Mock 返回
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          userName: "张三",
          records: [
            { date: "2023-10-01", amount: 300 },
            { date: "2023-10-02", amount: 320 },
            { date: "2023-10-05", amount: 300 },
            { date: "2023-10-15", amount: 450 },
            { date: "2023-11-01", amount: 300 },
            { date: "2023-11-02", amount: 280 },
            { date: "2023-11-03", amount: 300 },
            { date: "2023-11-10", amount: 500 },
            { date: "2023-11-20", amount: 300 },
            { date: "2023-12-01", amount: 350 },
            { date: "2023-12-05", amount: 350 },
            { date: "2023-12-12", amount: 600 },
            { date: "2023-12-13", amount: 600 },
            { date: "2023-12-25", amount: 800 },
          ]
        });
      }, 500);
    });
    // throw error; // 真实环境应抛出异常
  }
};
