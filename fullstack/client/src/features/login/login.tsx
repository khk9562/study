import LoginForm from './components/LoginForm';
import Lotus from '@/assets/images/Lotus';

export default function Login() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-purple-500">
      <div className="bg-white bg-opacity-20 p-8 rounded-3xl shadow-2xl backdrop-blur-sm max-w-md w-full">
        <div className="text-center mb-8">
          <Lotus />
          <h1 className="text-3xl font-bold text-white mb-2">환영합니다</h1>
          <p className="text-purple-100">
            당신의 여정에 함께 하게 되어 기쁩니다.
          </p>
          <p className="text-purple-100">매 순간이 의미 있고 아름답습니다.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
