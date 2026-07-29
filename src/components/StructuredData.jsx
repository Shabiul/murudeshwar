/**
 * Inject JSON-LD structured data into the page <head>.
 * Accepts a `data` prop (object or array of objects) and renders a <script type="application/ld+json">.
 */
export default function StructuredData({ data }) {
  if (!data) return null;
  const json = JSON.stringify(Array.isArray(data) ? data : data, null, 0);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/* ──────────────────────────────────────────
   Pre-built schema generators
   ────────────────────────────────────────── */

const BASE_URL = 'https://murudeshwara.com';
const BUSINESS_PHONE = '+919459363333';
const BUSINESS_EMAIL = 'murudeshwarapackages@gmail.com';

const addressSchema = {
  '@type': 'PostalAddress',
  streetAddress: 'Beach Road, Murdeshwar Temple Main Rd, Matadahitlu',
  addressLocality: 'Murudeshwar',
  addressRegion: 'Karnataka',
  postalCode: '581350',
  addressCountry: 'IN',
};

const geoSchema = {
  '@type': 'GeoCoordinates',
  latitude: 14.0943,
  longitude: 74.4845,
};

/* ── Organization ── */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Murudeshwara Beach Resort',
    url: BASE_URL,
    logo: `${BASE_URL}/videos/Gemini_Generated_Image_zh1fg9zh1fg9zh1f-removebg-preview.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_PHONE,
      email: BUSINESS_EMAIL,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Kannada'],
    },
    address: addressSchema,
    sameAs: [],
  };
}

/* ── WebSite + SearchAction ── */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Murudeshwara Beach Resort',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/* ── LocalBusiness ── */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#business`,
    name: 'Murudeshwara Beach Resort',
    description:
      'Premium beachfront resort in Murudeshwar offering PADI certified scuba diving courses, luxury stays with Arabian Sea views, bike & cab rentals, and guided tourism packages.',
    url: BASE_URL,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    image: `${BASE_URL}/Photos/DSC_3974.JPG`,
    address: addressSchema,
    geo: geoSchema,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: '₹₹',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '500',
      bestRating: '5',
    },
    hasMap: 'https://maps.google.com/?q=14.0943,74.4845',
  };
}

/* ── LodgingBusiness ── */
export function getLodgingSchema(rooms = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Murudeshwara Beachfront Stay',
    description:
      'Beachfront accommodation in Murudeshwar with sea view rooms, complimentary breakfast options, and modern amenities. Walking distance to Murudeshwar Temple.',
    url: `${BASE_URL}/beach-front-stay`,
    telephone: '+918988338383',
    email: BUSINESS_EMAIL,
    image: `${BASE_URL}/Photos/DSC_3974.JPG`,
    address: addressSchema,
    geo: geoSchema,
    starRating: { '@type': 'Rating', ratingValue: '4' },
    checkinTime: '12:00',
    checkoutTime: '11:00',
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Room Service', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Sea View', value: true },
    ],
    containsPlace: rooms.map((room) => ({
      '@type': 'HotelRoom',
      name: room.title,
      description: room.description,
      image: room.image?.startsWith('http') ? room.image : `${BASE_URL}${room.image}`,
      url: `${BASE_URL}/beach-front-stay/${room.id}`,
      bed: { '@type': 'BedDetails', typeOfBed: room.bed || 'Queen', numberOfBeds: 1 },
      occupancy: { '@type': 'QuantitativeValue', value: 2 },
      floorSize: {
        '@type': 'QuantitativeValue',
        value: parseInt(room.size) || 350,
        unitCode: 'SQF',
      },
    })),
  };
}

/* ── Course (Scuba) ── */
export function getCourseSchema(course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${BASE_URL}/courses/${course.id}`,
    image: course.image?.startsWith('http') ? course.image : `${BASE_URL}${course.image}`,
    provider: {
      '@type': 'Organization',
      name: 'Murudeshwara Dive Centre',
      url: BASE_URL,
    },
    educationalLevel: course.details?.level || 'Beginner',
    timeRequired: `P${course.details?.duration?.replace(/\s/g, '').toUpperCase() || '1D'}`,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      location: {
        '@type': 'Place',
        name: 'Murudeshwara Dive Centre',
        address: addressSchema,
      },
    },
  };
}

/* ── Courses listing ── */
export function getCoursesListSchema(courses) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PADI Scuba Diving Courses in Murudeshwar',
    description: 'Complete list of PADI certified scuba diving courses available at Murudeshwara Dive Centre',
    numberOfItems: courses.length,
    itemListElement: courses.map((course, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: course.title,
        description: course.description,
        url: `${BASE_URL}/courses/${course.id}`,
        provider: { '@type': 'Organization', name: 'Murudeshwara Dive Centre' },
      },
    })),
  };
}

/* ── Product (Rental) ── */
export function getRentalProductSchema({ name, description, category, image, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    category,
    image: image?.startsWith('http') ? image : `${BASE_URL}${image}`,
    url: `${BASE_URL}${url}`,
    brand: { '@type': 'Brand', name: 'Murudeshwara Beach Resort' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      seller: { '@type': 'Organization', name: 'Murudeshwara Beach Resort' },
    },
  };
}

/* ── FAQPage ── */
export function getFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/* ── BreadcrumbList ── */
export function getBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${BASE_URL}${item.url}` : undefined,
    })),
  };
}

/* ── TouristAttraction ── */
export function getTouristAttractionSchema(attraction) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: attraction.name,
    description: attraction.description,
    image: attraction.image?.startsWith('http') ? attraction.image : `${BASE_URL}${attraction.image}`,
    geo: geoSchema,
    address: addressSchema,
    isAccessibleForFree: true,
    touristType: ['Adventure Tourism', 'Beach Tourism', 'Cultural Tourism'],
  };
}
