import { ResourceLocation } from '../components/organisms/ResourceLocationList';

export interface LocationDetails extends ResourceLocation {
  price: number;
  rating: number;
  hero: string;
  about: string;
  images: string[];
  facilities: { icon: string; label: string }[];
}

const resourceLocations: LocationDetails[] = [
  {
    id: 'yala',
    name: 'Yala National Park',
    subtitle: 'Southern Province, Sri Lanka',
    price: 120,
    rating: 4.8,
    hero: '/images/yala1.jpg',
    thumbnail: '/images/yala1.jpg',
    about: 'Yala National Park is the most visited and second largest national park in Sri Lanka, renowned for its variety of wildlife including leopards, elephants, and birds. The park is located about 300 km from Colombo and is a must-visit for nature lovers.',
    images: ['/images/yala1.jpg', '/images/udawalawe.jpg', '/images/wilpattu.jpg', '/images/minneriya.jpg'],
    facilities: [
      { icon: '🦁', label: 'Wildlife' },
      { icon: '🚙', label: 'Jeep' },
      { icon: '🏨', label: 'Hotel' },
      { icon: '🗺️', label: 'Guide' },
      { icon: '🍽️', label: 'Meals' },
    ],
    description: 'Sri Lanka’s most famous wildlife park, known for leopards, elephants, and diverse birdlife.'
  },
  {
    id: 'udawalawe',
    name: 'Udawalawe National Park',
    subtitle: 'Sabaragamuwa Province, Sri Lanka',
    price: 90,
    rating: 4.7,
    hero: '/images/udawalawe.jpg',
    thumbnail: '/images/udawalawe.jpg',
    about: 'Udawalawe is renowned for its large elephant population and scenic landscapes. It is a great destination for wildlife enthusiasts and bird watchers.',
    images: ['/images/udawalawe.jpg', '/images/yala1.jpg', '/images/wilpattu.jpg', '/images/minneriya.jpg'],
    facilities: [
      { icon: '🐘', label: 'Elephants' },
      { icon: '🚙', label: 'Jeep' },
      { icon: '🏨', label: 'Hotel' },
      { icon: '🗺️', label: 'Guide' },
      { icon: '🍽️', label: 'Meals' },
    ],
    description: 'Renowned for its large elephant population and scenic landscapes.'
  },
  {
    id: 'wilpattu',
    name: 'Wilpattu National Park',
    subtitle: 'North Western Province, Sri Lanka',
    price: 100,
    rating: 4.6,
    hero: '/images/wilpattu.jpg',
    thumbnail: '/images/wilpattu.jpg',
    about: 'Wilpattu is the largest national park in Sri Lanka, famous for its natural lakes and leopards. It offers a tranquil safari experience.',
    images: ['/images/wilpattu.jpg', '/images/yala1.jpg', '/images/udawalawe.jpg', '/images/minneriya.jpg'],
    facilities: [
      { icon: '🦊', label: 'Leopards' },
      { icon: '🚙', label: 'Jeep' },
      { icon: '🏨', label: 'Hotel' },
      { icon: '🗺️', label: 'Guide' },
      { icon: '🍽️', label: 'Meals' },
    ],
    description: 'The largest national park in Sri Lanka, famous for its natural lakes and leopards.'
  },
  {
    id: 'minneriya',
    name: 'Minneriya National Park',
    subtitle: 'North Central Province, Sri Lanka',
    price: 80,
    rating: 4.5,
    hero: '/images/minneriya.jpg',
    thumbnail: '/images/minneriya.jpg',
    about: 'Minneriya is home to the famous “Gathering” of wild elephants during the dry season. It is a great place to witness large herds of elephants.',
    images: ['/images/minneriya.jpg', '/images/yala1.jpg', '/images/udawalawe.jpg', '/images/wilpattu.jpg'],
    facilities: [
      { icon: '🐘', label: 'Elephants' },
      { icon: '🚙', label: 'Jeep' },
      { icon: '🏨', label: 'Hotel' },
      { icon: '🗺️', label: 'Guide' },
      { icon: '🍽️', label: 'Meals' },
    ],
    description: 'Home to the famous “Gathering” of wild elephants during the dry season.'
  },
  {
    id: 'kaudulla',
    name: 'Kaudulla National Park',
    subtitle: 'North Central Province, Sri Lanka',
    price: 85,
    rating: 4.4,
    hero: '/images/kaudulla.jpg',
    thumbnail: '/images/kaudulla.jpg',
    about: 'Kaudulla is a popular spot for elephant safaris and bird watching. The park is known for its rich biodiversity and scenic beauty.',
    images: ['/images/kaudulla.jpg', '/images/minneriya.jpg', '/images/yala1.jpg', '/images/udawalawe.jpg'],
    facilities: [
      { icon: '🐘', label: 'Elephants' },
      { icon: '🚙', label: 'Jeep' },
      { icon: '🏨', label: 'Hotel' },
      { icon: '🗺️', label: 'Guide' },
      { icon: '🍽️', label: 'Meals' },
    ],
    description: 'A popular spot for elephant safaris and bird watching.'
  },
];

export default resourceLocations; 