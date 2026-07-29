import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

export function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      addToast('success', '¡Bienvenido de vuelta!');
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-12 border-2 border-slate-900 rounded-2xl flex items-center justify-center bg-[#FBB03B] shadow-xl shadow-yellow-100">
              <span className="text-xs font-black text-slate-900 tracking-tighter leading-none -mt-0.5">MI</span>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">MiLocal</h1>
          <p className="text-slate-500 font-medium mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100 space-y-6"
        >
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="text-sm font-bold text-slate-700"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#FBB03B] focus:ring-2 focus:ring-[#FBB03B]/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="carlos@startup.cl"
                autoComplete="email"
                aria-label="Correo electrónico"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="text-sm font-bold text-slate-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#FBB03B] focus:ring-2 focus:ring-[#FBB03B]/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-label="Contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#FBB03B] hover:text-slate-900 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FBB03B] focus:ring-offset-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar Sesión <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Link to register */}
        <p className="text-center mt-8 text-slate-500 font-medium">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-[#FBB03B] font-black hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
