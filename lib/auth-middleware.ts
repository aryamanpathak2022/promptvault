import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Middleware runs in the Edge runtime; keep this module Node-free.
export const { auth } = NextAuth(authConfig)

