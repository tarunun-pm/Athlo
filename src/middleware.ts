import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const url = request.nextUrl.clone();

    // ─────────────────────────────────────────────
    // 1. PUBLIC ROUTES — always allow
    // ─────────────────────────────────────────────
    if (url.pathname === '/') {
        return supabaseResponse;
    }

    let user = null;
    let role: string | null = null;
    
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;

        // Fetch role early if user is logged in
        if (user) {
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();
            role = userData?.role || null;
        }
    } catch (error) {
        console.error('Middleware Supabase Error:', error);
        // If Supabase throws (e.g. network failure), silently fall back to unauthenticated
        user = null;
        role = null;
    }



    // Auth pages: if already logged in, redirect away from signin/signup
    if (url.pathname.startsWith('/auth/')) {
        if (user) {
            if (role === 'physio') url.pathname = '/physio/dashboard';
            else if (role === 'athlete') url.pathname = '/athlete/dashboard';
            else url.pathname = '/onboarding/user-type';
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    // ─────────────────────────────────────────────
    // 2. REQUIRE AUTH for everything else
    // ─────────────────────────────────────────────
    if (!user) {
        url.pathname = '/auth/signin';
        return NextResponse.redirect(url);
    }

    // No role set yet — force onboarding user-type 
    // (but don't loop if they are already there)
    if (!role && !url.pathname.startsWith('/onboarding/')) {
        url.pathname = '/onboarding/user-type';
        return NextResponse.redirect(url);
    }

    // ─────────────────────────────────────────────
    // 3. ONBOARDING ROUTES 
    // ─────────────────────────────────────────────
    if (url.pathname.startsWith('/onboarding/')) {
        // If they already have a role and try to hit user-type, send them to their dashboard
        if (url.pathname === '/onboarding/user-type' && role) {
            if (role === 'physio') url.pathname = '/physio/dashboard';
            else url.pathname = '/athlete/dashboard';
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    // ─────────────────────────────────────────────
    // 4. ROLE-BASED ROUTING for /physio/* and /athlete/*
    // ─────────────────────────────────────────────
    
    // Physio trying to access athlete routes
    if (url.pathname.startsWith('/athlete/') && role !== 'athlete') {
        url.pathname = '/physio/dashboard';
        return NextResponse.redirect(url);
    }

    // Athlete trying to access physio routes
    if (url.pathname.startsWith('/physio/') && role !== 'physio') {
        url.pathname = '/athlete/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
