"use client";

import {
  acceptInvite,
  AuthError,
  getSettings,
  login,
  logout,
  MissingIdentityError,
  oauthLogin,
  requestPasswordRecovery,
  signup,
  updateUser,
} from "@netlify/identity";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

type Mode = "login" | "signup" | "forgot";

function authError(error: unknown) {
  if (error instanceof MissingIdentityError) return "Layanan akun belum tersedia. Silakan coba lagi setelah layanan diaktifkan.";
  if (error instanceof AuthError) {
    const cause = error.cause;
    const status = error.status ?? (cause && typeof cause === "object" && "status" in cause && typeof cause.status === "number" ? cause.status : undefined);
    if (/confirm/i.test(error.message)) return "Konfirmasikan email Anda melalui tautan di kotak masuk sebelum login.";
    if (status === 401 || status === 400) return "Email atau password tidak sesuai. Periksa kembali atau gunakan Lupa password.";
    if (status === 403) return "Pendaftaran atau metode masuk ini belum diaktifkan. Silakan hubungi pengelola.";
    if (status === 422) return "Data belum dapat diproses. Periksa email dan gunakan password yang lebih kuat.";
    if (status === 429) return "Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.";
  }
  return "Tidak dapat menghubungi layanan akun. Periksa koneksi lalu coba lagi.";
}

export function LoginForm() {
  const { user, ready, callbackError, passwordFlow, finishPasswordFlow } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    getSettings().then((settings) => {
      if (active) setGoogleEnabled(settings.providers.google === true);
    }).catch(() => {
      if (active) setGoogleEnabled(false);
    });
    return () => { active = false; };
  }, []);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup" && !passwordFlow && name.trim().length < 3) {
        setError("Nama lengkap minimal 3 karakter, tidak termasuk spasi di awal dan akhir.");
        return;
      }
      if (passwordFlow) {
        if (passwordFlow.type === "invite") {
          if (!passwordFlow.token) throw new Error("Invalid invite");
          await acceptInvite(passwordFlow.token, password);
        } else {
          await updateUser({ password });
        }
        finishPasswordFlow();
        setMessage("Password berhasil disimpan. Akun Anda siap digunakan.");
      } else if (mode === "forgot") {
        await requestPasswordRecovery(email.trim());
        setMessage("Jika email terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk dan folder spam.");
      } else if (mode === "signup") {
        const newUser = await signup(email.trim(), password, { full_name: name.trim() });
        setMessage(newUser.confirmedAt ? "Akun berhasil dibuat." : "Periksa email untuk mengonfirmasi akun, lalu masuk kembali. Periksa juga folder spam.");
      } else {
        await login(email.trim(), password);
      }
      setPassword("");
    } catch (failure) {
      setError(authError(failure));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      await logout();
      changeMode("login");
    } catch (failure) {
      setError(authError(failure));
    } finally {
      setBusy(false);
    }
  }

  function signInGoogle() {
    setError("");
    setBusy(true);
    try {
      oauthLogin("google");
    } catch (failure) {
      if (failure instanceof AuthError && failure.message === "Redirecting to OAuth provider") return;
      setError(authError(failure));
      setBusy(false);
    }
  }

  const field = "h-12 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
  const heading = passwordFlow ? "Buat password baru" : mode === "signup" ? "Buat akun Anda" : mode === "forgot" ? "Lupa password?" : "Senang Anda kembali";

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8" aria-busy={!ready || busy}>
      {!ready ? <p className="py-12 text-center text-text-secondary" role="status">Memeriksa sesi akun…</p> : user && !passwordFlow ? (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Akun saya</p>
          <h2 className="mt-3 break-words text-2xl font-bold">Halo, {user.name || "teman KosKembali"}.</h2>
          <p className="mt-2 break-words text-sm text-text-secondary">{user.email}</p>
          <p className="mt-5 rounded-lg bg-primary/5 p-4 text-sm text-primary">Anda sudah masuk. Temukan barang kos berikutnya atau coba demo pembayaran.</p>
          <div className="mt-6 grid gap-3">
            <Link className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-medium text-white hover:bg-primary-dark" href="/katalog">Jelajahi katalog</Link>
            <Link className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 font-medium text-primary" href="/pembayaran">Coba simulasi pembayaran</Link>
            <Button variant="secondary" onClick={signOut} disabled={busy}>{busy ? "Keluar…" : "Keluar dari akun"}</Button>
          </div>
        </>
      ) : (
        <>
          {!passwordFlow && mode !== "forgot" && (
            <div className="mb-7 grid grid-cols-2 rounded-lg bg-background p-1">
              {(["login", "signup"] as const).map((tab) => <button key={tab} type="button" disabled={busy} aria-pressed={mode === tab} onClick={() => changeMode(tab)} className={`min-h-11 rounded-md text-sm font-semibold ${mode === tab ? "bg-card text-primary shadow-sm" : "text-text-secondary"}`}>{tab === "login" ? "Masuk" : "Daftar"}</button>)}
            </div>
          )}
          <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{passwordFlow ? "Gunakan minimal 8 karakter untuk menjaga keamanan akun." : mode === "forgot" ? "Masukkan email akun untuk menerima tautan pemulihan." : "Pilih Google atau gunakan email Anda untuk melanjutkan."}</p>
          {!passwordFlow && mode !== "forgot" && (
            <>
              <button type="button" disabled={busy || !googleEnabled} onClick={signInGoogle} className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-border font-medium transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60" aria-describedby="google-status">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.7 4.7 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4L15.4 17c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.2H2.9v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.3 13.7a6 6 0 0 1 0-3.4V7.7H2.9a10 10 0 0 0 0 8.6l3.4-2.6Z"/><path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9.1 5.7l3.4 2.6C7.1 7.9 9.4 6.1 12 6.1Z"/></svg>
                Lanjutkan dengan Google
              </button>
              <p id="google-status" className="mt-2 text-xs leading-relaxed text-text-secondary">{googleEnabled === null ? "Memeriksa ketersediaan Google…" : googleEnabled ? "Anda diarahkan ke Google untuk masuk dengan aman." : "Login Google belum diaktifkan oleh pengelola. Gunakan email untuk sementara."}</p>
              <div className="my-5 flex items-center gap-3 text-xs text-text-secondary"><span className="h-px flex-1 bg-border" />atau dengan email<span className="h-px flex-1 bg-border" /></div>
            </>
          )}
          <form onSubmit={submit} className="mt-5 space-y-4">
            {!passwordFlow && mode === "signup" && <div><label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium">Nama lengkap</label><input id="auth-name" autoComplete="name" required minLength={3} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={field} disabled={busy} /></div>}
            {!passwordFlow && <div><label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium">Email</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className={field} disabled={busy} /></div>}
            {(passwordFlow || mode !== "forgot") && <div><label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium">{passwordFlow ? "Password baru" : "Password"}</label><div className="relative"><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" && !passwordFlow ? "current-password" : "new-password"} required minLength={mode === "signup" || passwordFlow ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} className={`${field} pr-24`} disabled={busy} /><button type="button" className="absolute inset-y-0 right-1 min-w-20 px-2 text-xs font-semibold text-primary" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? "Sembunyikan" : "Lihat"}</button></div>{mode === "signup" && <p className="mt-1.5 text-xs text-text-secondary">Minimal 8 karakter. Gunakan kombinasi huruf dan angka.</p>}</div>}
            {!passwordFlow && mode === "login" && <button type="button" disabled={busy} onClick={() => changeMode("forgot")} className="min-h-11 text-sm font-medium text-primary hover:underline">Lupa password?</button>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Memproses…" : passwordFlow ? "Simpan password baru" : mode === "forgot" ? "Kirim tautan pemulihan" : mode === "signup" ? "Buat akun" : "Masuk ke akun"}</Button>
            {!passwordFlow && mode === "forgot" && <button type="button" disabled={busy} onClick={() => changeMode("login")} className="min-h-11 w-full text-sm font-medium text-primary">Kembali ke halaman masuk</button>}
          </form>
        </>
      )}
      {(error || callbackError) && <p role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error-text">{error || callbackError}</p>}
      {message && <p role="status" className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success-text">{message}</p>}
    </section>
  );
}
