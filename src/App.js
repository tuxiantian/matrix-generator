import React, { useState, useEffect } from 'react';
import PairwiseComparison from './PairwiseComparison';

const BASE_URL = "http://127.0.0.1:5000";

function App() {
  const [history, setHistory] = useState([]);
  const [isNew, setIsNew] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const fetchHistory = () => {
    fetch(`${BASE_URL}/ahp_history`)
      .then(response => response.json())
      .then(data => setHistory(data))
      .catch(error => console.error('Error:', error));
  };
  // 获取历史记录
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleNewClick = () => {
    setSelectedData(null);
    setIsNew(true);
  };

  const handleDetailsClick = (data) => {
    setSelectedData(data);
    setIsNew(true);
  };

  const handleDelete = (id) => {
    fetch(`${BASE_URL}/ahp_delete?id=${id}`, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          fetchHistory(); // 重新获取历史记录，更新列表
        } else {
          alert('删除失败');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleBack = () => {
    setIsNew(false);
    fetchHistory();  // 返回到列表页时重新加载数据
  };

  return (
    <div className="App">
      <h1>AHP Decision System</h1>
      {!isNew ? (
        <div className="centered-table-container">
          <button className="custom-button"  onClick={handleNewClick}>新增</button>
          <h2>历史记录</h2>
          
          <table border="1" className="centered-table">
            <thead>
              <tr>
                <th>记录 ID</th>
                <th>准则</th>
                <th>备选方案</th>
                <th>最佳选择</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => {
                const responseData = JSON.parse(record.response_data);
                return ( <tr key={index}>
                  <td>{record.id}</td>
                  <td>{record.criteria_names}</td>
                  <td>{record.alternative_names}</td>
                  <td>{responseData.best_choice_name}</td>
                  <td>{new Date(record.created_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}</td>
                  <td>
                    <button className="custom-button" onClick={() => handleDetailsClick(record)}>详情</button>
                    <button className="custom-button" onClick={() => handleDelete(record.id)}>删除</button>
                  </td>
                </tr>);

              })}
            </tbody>
          </table>
        </div>
      ) : (
        <PairwiseComparison
          data={selectedData}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
