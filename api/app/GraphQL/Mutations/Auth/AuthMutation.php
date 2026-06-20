<?php

namespace App\GraphQL\Mutations\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Throwable;

class AuthMutation
{
    /**
     * @param  mixed  $_
     * @param  array{username: string, password: string}  $args
     * @return array{status: string, message: string, token?: string, user?: User}
     */
    public function login(mixed $_, array $args): array
    {
        DB::beginTransaction();

        $throttleKey = strtolower($args['username']).'|'.request()->ip();

        try {
            if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
                DB::commit();
                Log::warning('Login mutation blocked by rate limiter.', [
                    'username' => $args['username'] ?? null,
                    'ip' => request()->ip(),
                ]);

                return [
                    'status' => 'ERROR',
                    'message' => 'Too many login attempts. Please try again in '.RateLimiter::availableIn($throttleKey).' seconds.',
                ];
            }

            $user = User::where('username', $args['username'])->first();

            if (! $user || ! Hash::check($args['password'], $user->password)) {
                RateLimiter::hit($throttleKey);
                DB::commit();
                Log::warning('Login mutation failed. Invalid credentials.', [
                    'username' => $args['username'] ?? null,
                    'ip' => request()->ip(),
                ]);

                return [
                    'status' => 'ERROR',
                    'message' => 'Invalid credentials.',
                ];
            }

            RateLimiter::clear($throttleKey);

            Auth::guard('web')->login($user);
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();
            Log::info('Login mutation succeeded.', [
                'user_id' => $user->id,
            ]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Login successful.',
                'token' => $token,
                'user' => $user,
            ];
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Login mutation failed with exception.', [
                'username' => $args['username'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @param  mixed  $_
     * @param  array{username: string, first_name: string, last_name: string, email: string, password: string}  $args
     * @return array{status: string, message: string, token?: string, user?: User}
     */
    public function register(mixed $_, array $args): array
    {
        DB::beginTransaction();

        try {
            if (User::where('username', $args['username'])->exists()) {
                DB::commit();
                Log::warning('Register mutation blocked. Username already taken.', [
                    'username' => $args['username'] ?? null,
                ]);

                return [
                    'status' => 'ERROR',
                    'message' => 'Username already taken.',
                ];
            }

            if (User::where('email', $args['email'])->exists()) {
                DB::commit();
                Log::warning('Register mutation blocked. Email already registered.', [
                    'email' => $args['email'] ?? null,
                ]);

                return [
                    'status' => 'ERROR',
                    'message' => 'Email already registered.',
                ];
            }

            $user = User::create([
                'username' => $args['username'],
                'first_name' => $args['first_name'],
                'last_name' => $args['last_name'],
                'email' => $args['email'],
                'password' => Hash::make($args['password']),
                'role' => 'guest',
            ]);

            $user->assignRole('guest');

            Auth::guard('web')->login($user);
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();
            Log::info('Register mutation succeeded.', [
                'user_id' => $user->id,
                'username' => $user->username,
            ]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Registration successful.',
                'token' => $token,
                'user' => $user,
            ];
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Register mutation failed with exception.', [
                'username' => $args['username'] ?? null,
                'email' => $args['email'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @return array{status: string, message: string}
     */
    public function logout(): array
    {
        DB::beginTransaction();

        try {
            $user = Auth::user();
            if ($user instanceof User) {
                $user->tokens()->delete();
            }

            DB::commit();
            Log::info('Logout mutation succeeded.', [
                'user_id' => $user instanceof User ? $user->id : null,
            ]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Logged out successfully.',
            ];
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Logout mutation failed with exception.', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @param  mixed  $_
     * @param  array{token: string}  $args
     * @return array{status: string, message: string, token?: string, user?: User}
     */
    public function loginWithGoogle(mixed $_, array $args): array
    {
        $token = $args['token'];

        try {
            // 1. Verify token with Google's tokeninfo API
            $response = Http::timeout(10)
                ->get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $token,
                ]);

            if (! $response->successful()) {
                Log::warning('Google Auth failed. Token verification failed.', [
                    'response' => $response->body(),
                ]);
                return [
                    'status' => 'ERROR',
                    'message' => 'Invalid Google token.',
                ];
            }

            $payload = $response->json();

            // 2. Verify audience matches our Google Client ID
            $clientId = env('GOOGLE_CLIENT_ID', '853052679545-ph5bitniubfnm4cq2pnmdogsnqn2qdre.apps.googleusercontent.com');
            if (($payload['aud'] ?? '') !== $clientId) {
                Log::warning('Google Auth failed. Audience mismatch.', [
                    'payload_aud' => $payload['aud'] ?? null,
                ]);
                return [
                    'status' => 'ERROR',
                    'message' => 'Invalid Google audience.',
                ];
            }

            $email = $payload['email'] ?? null;
            if (! $email) {
                return [
                    'status' => 'ERROR',
                    'message' => 'Email not provided by Google.',
                ];
            }

            // 3. Find or create user
            $user = User::where('email', $email)->first();

            DB::beginTransaction();
            if (! $user) {
                // Generate a unique username based on the email
                $baseUsername = strstr($email, '@', true); // get text before @
                if (! $baseUsername) {
                    $baseUsername = 'user';
                }
                // Clean username to be alphanumeric
                $baseUsername = preg_replace('/[^a-zA-Z0-9]/', '', $baseUsername);
                
                $username = $baseUsername;
                $counter = 1;
                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                // Split name or use given/family names
                $firstName = $payload['given_name'] ?? $payload['name'] ?? 'Google';
                $lastName = $payload['family_name'] ?? 'User';

                $user = User::create([
                    'username' => $username,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'password' => Hash::make(Str::random(24)),
                    'role' => 'guest',
                ]);

                // Assign default role guest
                $user->assignRole('guest');
                Log::info('Google Auth: Created new user.', ['user_id' => $user->id]);
            }

            Auth::guard('web')->login($user);
            $tokenResult = $user->createToken('auth_token')->plainTextToken;

            DB::commit();
            Log::info('Google Login mutation succeeded.', [
                'user_id' => $user->id,
            ]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Login successful.',
                'token' => $tokenResult,
                'user' => $user,
            ];
        } catch (Throwable $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Google Login mutation failed with exception.', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @return User|null
     */
    public function me(): ?User
    {
        $user = Auth::user();

        return $user instanceof User ? $user : null;
    }
}
