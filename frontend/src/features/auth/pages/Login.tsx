import { useState } from "react";
import { useAuth } from "../auth.context";

export default function Login() {
  const { loginWithGoogle, loginWithPassword, signupWithPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");

    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Authentication failed";
      setError(msg);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithPassword(email, password);
      } else {
        await signupWithPassword(email, password, fullName);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isLogin
              ? "Sign in to MenuBuilder"
              : "Create your MenuBuilder account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use email and password or continue with Google.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="space-y-3">
            {!isLogin && (
              <input
                type="text"
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}
            <input
              type="email"
              required
              className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
          >
            {isLogin ? "Sign in with email" : "Create account"}
          </button>

          <div className="text-center text-sm">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="group relative flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
