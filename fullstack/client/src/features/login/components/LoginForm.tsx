import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import apiClient from '@/utils/apiClient';
import { AxiosError } from 'axios';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const postLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await apiClient.post('/auth/login', {
        email,
        password,
      });
      console.log('Login attempt', { email, password });
      console.log('res', res);
    } catch (error) {
      console.error('login', error);
      if (error instanceof AxiosError && error?.response?.data?.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  return (
    <form onSubmit={postLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          이메일
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white bg-opacity-20 border-purple-300 w-full placeholder-purple-200 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          비밀번호
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white bg-opacity-20 border-purple-300 w-full placeholder-purple-200 text-white"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        로그인
      </Button>
      <div className="text-center">
        <a href="#" className="text-sm text-purple-200 hover:text-white">
          비밀번호를 잊으셨나요?
        </a>
      </div>
    </form>
  );
}
