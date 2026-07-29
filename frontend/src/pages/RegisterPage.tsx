import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Briefcase, Key, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import type { UserType } from '@/types';

function validateRut(rut: string): boolean {
  if (!rut) return true; // Optional field
  // Remove dots and dash
  const cleaned = rut.replace(/[.-]/g, '');
  if (cleaned.length < 7 || cleaned.length > 9) return false;
  
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }
  
  const expectedDv = 11 - (sum % 11);
  let expectedChar: string;
  if (expectedDv === 11) expectedChar = '0';
  else if (expectedDv === 10) expectedChar = 'K';
  else expectedChar = expectedDv.toString();
  
  return dv === expectedChar;
}

function formatRut(value: string): string {
  // Remove all non-numeric/K characters
  let cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleaned.length === 0) return '';
  
  // Separate body and DV
  const dv = cleaned.slice(-1);
  let body = cleaned.slice(0, -1);
  
  if (body.length === 0 && cleaned.length === 1) {
    return cleaned; // Just typing the first digit
  }
  
  // Format body with dots
  let formatted = '';
  while (body.length > 3) {
    formatted = '.' + body.slice(-3) + formatted;
    body = body.slice(0, -3);
  }
  formatted = body + formatted;
  
  return cleaned.length > 1 ? `${formatted}-${dv}` : cleaned;
}

export function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('entrepreneur');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    setRut(formatted);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos obligatorios son requeridos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (rut && !validateRut(rut)) {
      setError('El RUT ingresado no es válido');
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password, userType, rut || undefined);
      addToast('success', '¡Cuenta creada exitosamente!');
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
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
          <p className="text-slate-500 font-medium mt-2">Crea tu cuenta</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-100 space-y-6"
        >
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="register-name"
              className="text-sm font-bold text-slate-700"
            >
              Nombre completo
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#FBB03B] focus:ring-2 focus:ring-[#FBB03B]/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="Carlos Emprendedor"
                autoComplete="name"
                aria-label="Nombre completo"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="register-email"
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
                id="register-email"
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

          {/* RUT (optional) */}
          <div className="space-y-2">
            <label
              htmlFor="register-rut"
              className="text-sm font-bold text-slate-700"
            >
              RUT <span className="text-slate-400 font-medium">(opcional)</span>
            </label>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="register-rut"
                type="text"
                value={rut}
                onChange={(e) => handleRutChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#FBB03B] focus:ring-2 focus:ring-[#FBB03B]/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="12.345.678-9"
                autoComplete="off"
                aria-label="RUT (opcional)"
                maxLength={12}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Formato: XX.XXX.XXX-X. Opcional para agilizar la verificación.</p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="register-password"
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
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#FBB03B] focus:ring-2 focus:ring-[#FBB03B]/20 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                aria-label="Contraseña"
                required
                minLength={6}
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

          {/* User Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Tipo de usuario
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('entrepreneur')}
                className={`p-4 border-2 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 ${
                  userType === 'entrepreneur'
                    ? 'border-[#FBB03B] bg-[#FBB03B]/5 text-slate-900 shadow-sm'
                    : 'border-gray-100 text-slate-400 hover:border-gray-200'
                }`}
                aria-label="Soy Emprendedor"
              >
                <Briefcase size={24} className={userType === 'entrepreneur' ? 'text-[#FBB03B]' : 'text-slate-300'} />
                <span>Emprendedor</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('owner')}
                className={`p-4 border-2 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 ${
                  userType === 'owner'
                    ? 'border-[#FBB03B] bg-[#FBB03B]/5 text-slate-900 shadow-sm'
                    : 'border-gray-100 text-slate-400 hover:border-gray-200'
                }`}
                aria-label="Soy Propietario"
              >
                <Key size={24} className={userType === 'owner' ? 'text-[#FBB03B]' : 'text-slate-300'} />
                <span>Propietario</span>
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
                Creando cuenta...
              </>
            ) : (
              <>
                Crear Cuenta <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center mt-8 text-slate-500 font-medium">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-[#FBB03B] font-black hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
