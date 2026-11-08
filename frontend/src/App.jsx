import { RouterProvider } from 'react-router'
import AuthProvider from './app/provider/AuthProvider.jsx'
import { router } from './app/router/routes.jsx'
import './assets/enrollment.css'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
