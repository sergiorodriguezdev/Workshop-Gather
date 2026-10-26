import { type ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { getListMyRsvpsQueryKey } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import WorkshopDetail from '@/pages/workshop-detail';
import MyRsvps from '@/pages/my-rsvps';
import { SignInPage, SignUpPage } from '@/pages/auth';
import { clerkAppearance } from '@/lib/clerk-appearance';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in the app environment.');
}

function Router() {
  return (
    <ClerkRouter />
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClearRsvpCacheOnAuthChange() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const previous = useRef<{ loaded: boolean; userId?: string }>({ loaded: false });

  useEffect(() => {
    if (!isLoaded) return;
    const nextUserId = user?.id;
    if (previous.current.loaded && previous.current.userId !== nextUserId) {
      queryClient.removeQueries({ queryKey: getListMyRsvpsQueryKey() });
    }
    previous.current = { loaded: true, userId: nextUserId };
  }, [isLoaded, user?.id, queryClient]);

  return null;
}

function ClerkRouter() {
  const [, setLocation] = useLocation();
  const stripBase = (path: string) =>
    basePath && path.startsWith(basePath)
      ? path.slice(basePath.length) || '/'
      : path;

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Welcome back',
            subtitle: 'Sign in to keep your workshop plans together',
          },
        },
        signUp: {
          start: {
            title: 'Create your Gather account',
            subtitle: 'Save workshops and make room for something new',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClearRsvpCacheOnAuthChange />
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/" component={Home} />
          <Route path="/workshops/:id" component={WorkshopDetail} />
          <Route path="/my-rsvps" component={MyRsvps} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
