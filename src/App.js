import React, { useState } from 'react';
import './App.css';  // 引入 CSS 文件

// 定义基础 URL 前缀
const BASE_URL = "http://127.0.0.1:5000";

// 封装 fetch 请求
const fetchWithPrefix = (endpoint, options = {}) => {
    return fetch(`${BASE_URL}${endpoint}`, options);
};

function PairwiseComparison() {
  const [criteriaNames, setCriteriaNames] = useState([]);
  const [alternativeNames, setAlternativeNames] = useState([]);
  const [criteriaMatrix, setCriteriaMatrix] = useState([]);
  const [alternativesMatrices, setAlternativesMatrices] = useState([]);
  const [result, setResult] = useState(null);
  const [lastRequestData, setLastRequestData] = useState(null);

  const handleCriteriaChange = (index, value) => {
    const updatedCriteriaNames = [...criteriaNames];
    updatedCriteriaNames[index] = value;
    setCriteriaNames(updatedCriteriaNames);
  };

  const handleAlternativeChange = (index, value) => {
    const updatedAlternativeNames = [...alternativeNames];
    updatedAlternativeNames[index] = value;
    setAlternativeNames(updatedAlternativeNames);
  };

  const generateMatrices = () => {
    const criteriaCount = criteriaNames.length;
    const alternativesCount = alternativeNames.length;

    const newCriteriaMatrix = Array(criteriaCount).fill(null).map((_, i) =>
      Array(criteriaCount).fill(null).map((_, j) => (i === j ? '1' : ''))
    );
    setCriteriaMatrix(newCriteriaMatrix);

    const newAlternativesMatrices = Array(criteriaCount).fill(null).map(() =>
      Array(alternativesCount).fill(null).map((_, i) =>
        Array(alternativesCount).fill(null).map((_, j) => (i === j ? '1' : ''))
      )
    );
    setAlternativesMatrices(newAlternativesMatrices);
  };

  const parseFraction = (value) => {
    if (value.includes('/')) {
      const [numerator, denominator] = value.split('/').map(Number);
      return denominator ? numerator / denominator : parseFloat(value);
    }
    return parseFloat(value);
  };

  const reciprocalAsFraction = (value) => {
    if (value.includes('/')) {
      const [numerator, denominator] = value.split('/').map(Number);
      const reciprocal = denominator / numerator;
      return Number.isInteger(reciprocal) ? reciprocal.toString() : `${denominator}/${numerator}`;
    } else {
      const numValue = parseFloat(value);
      return numValue === 1 ? '1' : `1/${numValue}`;
    }
  };

  const updateCriteriaMatrix = (row, col, value) => {
    const reciprocal = reciprocalAsFraction(value);

    const newMatrix = criteriaMatrix.map((r, i) =>
      r.map((cell, j) => {
        if (i === row && j === col) return value;
        if (i === col && j === row) return reciprocal;
        return cell;
      })
    );
    setCriteriaMatrix(newMatrix);
  };

  const updateAlternativesMatrix = (criteriaIndex, row, col, value) => {
    const reciprocal = reciprocalAsFraction(value);

    const updatedMatrices = alternativesMatrices.map((matrix, idx) =>
      idx === criteriaIndex
        ? matrix.map((r, i) =>
            r.map((cell, j) => {
              if (i === row && j === col) return value;
              if (i === col && j === row) return reciprocal;
              return cell;
            })
          )
        : matrix
    );
    setAlternativesMatrices(updatedMatrices);
  };

  const submitMatrices = () => {
    const data = {
      criteria_matrix: criteriaMatrix,
      alternative_matrices: alternativesMatrices,
      alternative_names: alternativeNames
    };

    setLastRequestData(data);
    

    fetchWithPrefix('/ahp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => setResult(data))
    .catch(error => {
      console.error('Error:', error);
      setResult('Error submitting data');
    });
  };

  const saveHistory = () => {
    const data = {
        request_data: lastRequestData,
        response_data: result
    };

    fetchWithPrefix('/save_history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => alert(data.message || 'History saved successfully!'))
    .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container">
      <h3>Enter Criteria Names</h3>
      {[...Array(criteriaNames.length + 1)].map((_, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Criterion ${index + 1}`}
          value={criteriaNames[index] || ''}
          onChange={(e) => handleCriteriaChange(index, e.target.value)}
        />
      ))}

      <h3>Enter Alternative Names</h3>
      {[...Array(alternativeNames.length + 1)].map((_, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Alternative ${index + 1}`}
          value={alternativeNames[index] || ''}
          onChange={(e) => handleAlternativeChange(index, e.target.value)}
        />
      ))}
      <br></br>
      <button onClick={generateMatrices}>Generate Matrices</button>

      {criteriaNames.length > 0 && (
        <>
          <h3>Criteria Pairwise Comparison Matrix</h3>
          <table border="1">
            <thead>
              <tr>
                <th></th>
                {criteriaNames.map((name, idx) => (
                  <th key={idx}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteriaMatrix.map((row, i) => (
                <tr key={i}>
                  <td>{criteriaNames[i]}</td>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <input
                        type="text"
                        value={j === i ? '1' : cell}
                        onChange={(e) => updateCriteriaMatrix(i, j, e.target.value)}
                        disabled={i === j}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {alternativesMatrices.map((matrix, idx) => (
        <div key={idx}>
          <h3>Alternatives Pairwise Comparison Matrix for Criterion: {criteriaNames[idx]}</h3>
          <table border="1">
            <thead>
              <tr>
                <th></th>
                {alternativeNames.map((name, jdx) => (
                  <th key={jdx}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td>{alternativeNames[i]}</td>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <input
                        type="text"
                        value={j === i ? '1' : cell}
                        onChange={(e) => updateAlternativesMatrix(idx, i, j, e.target.value)}
                        disabled={i === j}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <button onClick={submitMatrices}>Submit</button>

      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {result && <button onClick={saveHistory}>Save to History</button>}
    </div>
  );
}

export default PairwiseComparison;
