import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function checkHealth() {
  try {
    console.log('Checking health...');
    const res = await axios.get(`${API_URL}/health`);
    console.log('Health Check Status:', res.status, res.data);
  } catch (error) {
    console.error('Health Check Failed:', error.message);
  }
}

checkHealth();
