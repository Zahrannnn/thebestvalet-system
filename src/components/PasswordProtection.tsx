import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface PasswordProtectionProps {
  onAuthenticate: (success: boolean) => void;
  correctPassword: string | Promise<string>;
  title?: string;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ 
  onAuthenticate, 
  correctPassword,
  title = "Dashboard" 
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [resolvedPassword, setResolvedPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve the password if it's a Promise
  useEffect(() => {
    const resolvePassword = async () => {
      if (typeof correctPassword === 'string') {
        setResolvedPassword(correctPassword);
        setIsLoading(false);
      } else {
        try {
          const resolvedValue = await correctPassword;
          setResolvedPassword(resolvedValue);
        } catch (error) {
          console.error('Error resolving password:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    resolvePassword();
  }, [correctPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === resolvedPassword) {
      onAuthenticate(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-amber-200">
          <div className="text-center">
            <img src="/lloogo.png" alt="The Best Valet" className="h-20 mx-auto mb-4" />
            <p className="text-amber-700">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-amber-200">
        <div className="text-center mb-6">
          <img src="/lloogo.png" alt="The Best Valet" className="h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-800">{title}</h2>
          <p className="text-amber-700 mt-2">Please enter password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pl-10 border-amber-200 focus:border-amber-400 focus:ring-amber-400 ${
                error ? 'border-red-500 animate-shake' : ''
              }`}
              placeholder="Enter password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            Login
          </Button>
          
          {error && (
            <p className="text-red-500 text-sm text-center">
              Incorrect password. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection; 