import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import Layout from '@/components/Layout';
import Feed from '@/pages/Feed';
import PostDetail from '@/pages/PostDetail';
import PostEditor from '@/components/PostEditor';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/new" element={<PostEditor />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
