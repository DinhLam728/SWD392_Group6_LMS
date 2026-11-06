import PublicLayout from '../layouts/PublicLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import MyRegistrationsPage from '../../modules/enrollment/pages/MyRegistrationsPage.jsx'
import RegistrationResultPage from '../../modules/enrollment/pages/RegistrationResultPage.jsx'
import PaymentQrPage from '../../modules/payment/pages/PaymentQrPage.jsx'

export const studentRoutes = [{
  element: <ProtectedRoute role="STUDENT" />,
  children: [{
    element: <PublicLayout />,
    children: [
      { path: '/registrations', element: <MyRegistrationsPage /> },
      { path: '/registrations/:id', element: <RegistrationResultPage /> },
      { path: '/registrations/:id/payment', element: <PaymentQrPage /> },
    ],
  }],
}]
