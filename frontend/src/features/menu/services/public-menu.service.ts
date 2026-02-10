
import api from '../../../shared/utils/api';
import type { Category } from './menu.service';
import type { Business } from '../../business/services/business.service';

export interface PublicMenuData {
  business: Business;
  categories: Category[];
}

export const publicMenuService = {
  getMenuBySlug: async (slug: string) => {
    if (slug === 'demo-restaurant') {
        // Return mock data for the demo
        return {
            business: {
                id: 'demo',
                name: 'MenuX Bistro',
                slug: 'demo-restaurant',
                description: 'Experience the future of dining. This is a demo of the MenuX platform.',
                address: '123 Innovation Blvd, Tech City',
                contact_phone: '+1 (555) 0123-456',
                contact_email: 'hello@menux.com',
                logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&h=200&q=80', // Placeholder
                website_url: 'https://menux.com',
                social_links: { twitter: 'https://twitter.com/menux' },
                opening_hours: { "Mon-Fri": "9:00 - 22:00" },
                is_published: true,
                owner_id: 'demo',
                business_type: 'restaurant' as const,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            categories: [
                {
                    id: 'c1',
                    name: 'Starters',
                    description: 'Begin your digital journey',
                    sort_order: 0,
                    business_id: 'demo',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    items: [
                        {
                            id: 'i1',
                            name: 'Instant Loading Bruschetta',
                            description: 'Crispy bread topped with fresh tomatoes and zero latency. Served instantly.',
                            price: 12,
                            category_id: 'c1',
                            business_id: 'demo',
                            is_available: true,
                            is_vegetarian: true,
                            is_spicy: false,
                            sort_order: 0,
                            image_url: 'https://images.unsplash.com/photo-1572695157363-bc31c5ac0c8e?auto=format&fit=crop&w=800&q=80',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        },
                         {
                            id: 'i2',
                            name: 'Smooth Scroll Carpaccio',
                            description: 'Thinly sliced beef with a drizzle of fluid animations and GSAP interactions.',
                            price: 18,
                            category_id: 'c1',
                            business_id: 'demo',
                            is_available: true,
                            is_vegetarian: false,
                            is_spicy: false,
                            sort_order: 1,
                            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: 'c2',
                    name: 'Main Courses',
                    description: 'The core features of our platform',
                    sort_order: 1,
                    business_id: 'demo',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    items: [
                        {
                            id: 'i3',
                            name: 'Analytics Steak',
                            description: 'Prime cut ribeye cooked to perfection, served with a side of real-time data visualization.',
                            price: 45,
                            category_id: 'c2',
                            business_id: 'demo',
                            is_available: true,
                            is_vegetarian: false,
                            is_spicy: false,
                            sort_order: 0,
                            image_url: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=800&q=80',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        },
                        {
                            id: 'i4',
                            name: 'SEO Salmon',
                            description: 'Fresh grilled salmon that ranks #1 on Google. Caught wild in the streams of the internet.',
                            price: 32,
                            category_id: 'c2',
                            business_id: 'demo',
                            is_available: true,
                            is_vegetarian: false,
                            is_spicy: false,
                            sort_order: 1,
                            image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4974?auto=format&fit=crop&w=800&q=80',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: 'c3',
                    name: 'Desserts',
                    description: 'Sweet finishes for your business',
                    sort_order: 2,
                    business_id: 'demo',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    items: [
                        {
                            id: 'i5',
                            name: 'Dark Mode Chocolate Cake',
                            description: 'Rich, dark chocolate layer cake. Easy on the eyes, delicious on the palate.',
                            price: 14,
                            category_id: 'c3',
                            business_id: 'demo',
                            is_available: true,
                            is_vegetarian: true,
                            is_spicy: false,
                            sort_order: 0,
                            image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    ]
                }
            ]
        };
    }

    // Note: The backend public endpoint might return a different structure.
    // Based on backend implementation: GET /menu/:slug 
    // It returns { success: true, data: { business, categories } }
    const response = await api.get<{ success: boolean; data: PublicMenuData }>(`/menu/${slug}`);
    return response.data.data;
  }
};
