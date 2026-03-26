import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Feed from '@/pages/Feed';
import PostDetail from '@/pages/PostDetail';
import PostEditor from '@/components/PostEditor';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/new" element={<PostEditor />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
