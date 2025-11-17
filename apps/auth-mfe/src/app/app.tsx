import { useLocation } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

export function App() {
  const location = useLocation();

  // When embedded in shell, render component based on current path
  // The shell's router handles the routing, we just render the right component
  if (location.pathname === '/register') {
    return <Register />;
  }

  if (location.pathname === '/forgot-password') {
    return <ForgotPassword />;
  }

  if (location.pathname.startsWith('/reset-password/')) {
    return <ResetPassword />;
  }

  // Default to login for /login or any other path
  return <Login />;
}

export default App;
