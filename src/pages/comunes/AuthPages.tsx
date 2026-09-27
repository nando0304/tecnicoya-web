import { Link } from '@tanstack/react-router'
import { LoginForm, RegisterForm } from '@/features/auth'
import { AuthLayout } from '@/widgets/auth-layout'

export function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Ingresa a tu cuenta para continuar"
      footer={
        <>
          ¿Aún no tienes una cuenta?{' '}
          <Link to="/registro" className="font-semibold text-primary hover:underline">
            Regístrate aquí
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}

export function RegisterPage() {
  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Regístrate gratis en menos de un minuto"
      ancho="lg"
      footer={
        <>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
