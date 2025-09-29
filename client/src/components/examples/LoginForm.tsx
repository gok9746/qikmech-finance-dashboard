import LoginForm from '../auth/LoginForm';

export default function LoginFormExample() {
  const handleLogin = (email: string, role: 'admin' | 'staff' | 'accountant') => {
    console.log('Login example triggered', { email, role });
    alert(`Logged in as ${role}: ${email}`);
  };

  return <LoginForm onLogin={handleLogin} />;
}