import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Login_page/login';
import WebPage from './Main_page/Web_page';
import Upload from './Import_data/Uplode';
import Dashboard from './graph_page/Dashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <WebPage />,
  },
  {
    path: "/upload",
    element: <Upload />,
  },
  {
    path: "/results",
    element: <Dashboard />,
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
