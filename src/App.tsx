import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import Feed from '@/pages/Feed';
import PostDetail from '@/pages/PostDetail';
import PostEditor from '@/components/PostEditor';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/new" element={<PostEditor />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
