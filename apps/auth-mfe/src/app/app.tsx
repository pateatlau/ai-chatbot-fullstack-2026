import { useLocation } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

export function App() {
  const location = useLocation();

  // When embedded in shell, render component based on current path
  // The shell's router handles the routing, we just render the right component
  if (location.pathname === '/register') {
    return <Register />;
  }

  // Default to login for /login or any other path
  return <Login />;
}

export default App;
