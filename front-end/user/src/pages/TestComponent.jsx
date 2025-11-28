import React from 'react';

// Simple test component to verify React is working
const TestComponent = () => {
  return (
    <div style={{
      padding: '50px',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#007bff' }}>✅ React is Working!</h1>
      <p>If you see this, your React app is running correctly.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Debug Information:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ React loaded</li>
          <li>✅ Component rendered</li>
          <li>✅ Styles applied</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <a href="/login" style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default TestComponent;
