import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Event from './pages/event';              

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Event />} />
      </Routes>
    </Router>
  );
}
