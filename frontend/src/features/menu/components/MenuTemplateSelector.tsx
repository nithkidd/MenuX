import type { PublicMenuData } from '../services/public-menu.service';
import { RestaurantGridTemplate } from '../templates/restaurant/RestaurantGridTemplate';
import { DefaultListTemplate } from '../templates/default/DefaultListTemplate';

interface MenuTemplateSelectorProps {
  data: PublicMenuData;
  currentLang: 'en' | 'km';
}

export function MenuTemplateSelector({ data, currentLang }: MenuTemplateSelectorProps) {
  const { business } = data;

  // Template Selection Logic
  // future-proofing: could also check business.template_id if added
  const businessType = business.business_type;

  switch (businessType) {
    case 'restaurant':
        return <RestaurantGridTemplate data={data} currentLang={currentLang} />;
    
    // Future example:
    // case 'gaming_gear':
    //    return <GamingGearTemplate data={data} />;

    default:
        // Use Default List for unknown types or specific 'default' type
        return <DefaultListTemplate data={data} />;
  }
}
