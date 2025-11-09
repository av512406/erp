import LoginPage from '../LoginPage';

export default function LoginPageExample() {
  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', email, password);
  };

  return <LoginPage onLogin={handleLogin} />;
}
