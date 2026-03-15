import React from 'react';
import './style.scss'; // Импортируем без переменной
import Title from '@/components/Title.tsx'
function App() {
  return (
    // Используем просто строку с названием класса
    <div className="container"> 
      <Title/>
      <p>Webpack теперь собирает и это.</p>
    </div>
  );
}

export default App;
