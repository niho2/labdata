import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import './App.css';
import 'chartjs-adapter-date-fns';


ChartJS.register(...registerables);

function App() {
  const [table, setTable] = useState('labdata');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [minTime, setMinTime] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [data, setData] = useState([]);

  // Hole den verfügbaren Zeitbereich, sobald die Tabelle geändert wird
  useEffect(() => {
    const fetchTimeRange = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/${table}/timeRange`);
        setMinTime(response.data.minTimestamp);
        setMaxTime(response.data.maxTimestamp);
        // Setze Start und Ende standardmäßig auf den gesamten vorhandenen Zeitraum
        setStart(response.data.minTimestamp);
        setEnd(response.data.maxTimestamp);
      } catch (error) {
        console.error("Fehler beim Abrufen des Zeitbereichs:", error);
      }
    };

    fetchTimeRange();
  }, [table]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/${table}`, {
        params: {
          start,
          end,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten:", error);
    }
  };

  // Bereite die Chart‑Daten vor
  const chartData = {
    labels: data.map(item => item.Timestamp),
    datasets: [
      {
        label: 'Concentration of Active Ingredient',
        data: data.map(item => item["Concentration of Active Ingredient"]),
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Pressure',
        data: data.map(item => item.Pressure),
        borderColor: 'red',
        fill: false,
      },
      {
        label: 'pH Level',
        data: data.map(item => item["pH Level"]),
        borderColor: 'green',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Lab Data Graph' },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
          displayFormats: { hour: 'yyyy-MM-dd HH:mm' }
        }
      }
    }
  };

  return (
    <div className="App">
      <h1>Lab Data Graph Viewer</h1>
      <div className="controls">
        <label>
          Tabelle:
          <select value={table} onChange={(e) => setTable(e.target.value)}>
            <option value="labdata">Lab Data</option>
            <option value="labdata2">Lab Data 2</option>
            <option value="labdata3">Lab Data 3</option>
          </select>
        </label>
        <label>
          Start:
          <input
            type="datetime-local"
            value={start}
            min={minTime}
            max={maxTime}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          Ende:
          <input
            type="datetime-local"
            value={end}
            min={minTime}
            max={maxTime}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button onClick={fetchData}>Daten abrufen</button>
      </div>
      <div className="chart-container">
        {data.length > 0 && (
          <Line key={data.length} data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

export default App;
