import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../components/shared/PlaceholderPage';
import { getCustomerById } from '../services/customerRepository';

export function CustomerPlaceholder() {
  const { customerId } = useParams<{ customerId: string }>();
  const customer = customerId ? getCustomerById(customerId) : undefined;

  return (
    <PlaceholderPage
      eyebrow="Customer Success OS"
      title={customer ? customer.name : 'Customer'}
      message="Customer Health Report — coming in Phase 3."
    />
  );
}
