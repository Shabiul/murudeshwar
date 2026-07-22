-- Setup SQL script for Murudeshwara Resort Database

-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors
DROP POLICY IF EXISTS "Allow public read" ON site_content;
DROP POLICY IF EXISTS "Allow public insert" ON site_content;
DROP POLICY IF EXISTS "Allow public update" ON site_content;
DROP POLICY IF EXISTS "Allow public delete" ON site_content;

-- Recreate policies
CREATE POLICY "Allow public read" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON site_content FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON site_content FOR DELETE USING (true);

-- Seed site_content table with all static datasets
INSERT INTO site_content (key, data) VALUES
('attractions', '[
  {
    "id": 1,
    "name": "Murudeshwar Temple & Shiva Statue",
    "shortDescription": "Iconic Spiritual Landmark",
    "description": "The statue of Lord Shiva is the main focus of the Murudeshwar temple and city''s famous tourist attraction. It is majestically overlooking the Arabian Sea from the top of a small hill.",
    "image": "/gallery/Murudeshwar_temple_statue.jpg",
    "distance": "0.5 km",
    "timings": "6:00 AM - 8:00 PM",
    "highlights": [
      "Raja Gopura offers breathtaking views of sunrise and sunset with scenic chair ride to the peak."
    ],
    "featured": true
  },
  {
    "id": 2,
    "name": "Murudeshwar Beach",
    "shortDescription": "Arabian Sea Coastline",
    "description": "Well famous for its serene surroundings, quiet waves, and spotless coastlines. Perfect for evening walks while watching the beautiful sunset with your loved ones.",
    "image": "/gallery/Murudeshwar-Beach.webp",
    "distance": "0.3 km",
    "timings": "Open 24 Hours",
    "highlights": [
      "Calming sound of waves and refreshing sea wind with stunning sunset views."
    ],
    "featured": true
  },
  {
    "id": 3,
    "name": "Netrani Island",
    "shortDescription": "Pigeon Island - Scuba Paradise",
    "description": "An ideal location for those who enjoy outdoor adventure. Experience scuba diving under crystal clear water, explore colourful coral reefs and vibrant marine life.",
    "image": "/gallery/NETRANI_ISLAND(Arabian_sea).jpg",
    "distance": "19 km",
    "timings": "8:00 AM - 4:00 PM",
    "highlights": [
      "Best spot for scuba diving and snorkelling in Karnataka."
    ],
    "featured": true
  },
  {
    "id": 4,
    "name": "Floating Sea Bridge",
    "shortDescription": "Coastal Views",
    "description": "A newer addition to Murudeshwar''s tourist attractions, the Floating Sea Bridge reaches into the Arabian Sea and offers stunning views of the coastline and the gigantic Shiva statue.",
    "image": "/gallery/kerala-floating-bridge.avif",
    "distance": "0.4 km",
    "timings": "6:00 AM - 8:00 PM",
    "highlights": [
      "Perfect spot for peaceful strolls and photo shoots."
    ],
    "featured": false
  },
  {
    "id": 5,
    "name": "Jog Falls",
    "shortDescription": "India''s Tallest Waterfall",
    "description": "India''s tallest waterfalls offering a spectacular view of cascading water. A must-visit location to witness the power and beauty of nature.",
    "image": "/gallery/venkat-sudheer-reddy-KhZ6UUsC_c8-unsplash.jpg",
    "distance": "100 km",
    "timings": "6:00 AM - 6:00 PM",
    "highlights": [
      "Spectacular monsoon views, ideal for photography and nature lovers."
    ],
    "featured": false
  },
  {
    "id": 6,
    "name": "Apsara Konda Falls",
    "shortDescription": "Historical Heritage Site",
    "description": "A serene and picturesque waterfall nestled in the lush greenery, perfect for a peaceful getaway and nature exploration.",
    "image": "/gallery/109288826Murudeshwar_Apsarakonda_Main.jpg",
    "distance": "35 km",
    "timings": "8:00 AM - 5:00 PM",
    "highlights": [
      "Beautiful natural pool, great for a refreshing dip and picnic spot."
    ],
    "featured": false
  },
  {
    "id": 7,
    "name": "Eco Beach & Honnavar",
    "shortDescription": "Secluded Beach Experience",
    "description": "A pristine and less crowded beach with clear waters and golden sand, ideal for relaxation and sunbathing.",
    "image": "/gallery/Eco-Beach-scaled.jpeg",
    "distance": "25 km",
    "timings": "Open 24 Hours",
    "highlights": [
      "Clean and peaceful beach, perfect for watching sunrises and sunsets."
    ],
    "featured": false
  },
  {
    "id": 8,
    "name": "Kollur Mookambika Temple",
    "shortDescription": "Divine Destination",
    "description": "A famous Hindu temple dedicated to Goddess Mookambika, known for its spiritual significance and beautiful architecture.",
    "image": "/gallery/Kollur_Mookambika_Temple_20080123.JPG",
    "distance": "80 km",
    "timings": "5:00 AM - 12:30 PM, 4:30 PM - 9:00 PM",
    "highlights": [
      "Pilgrimage site, cultural and architectural beauty."
    ],
    "featured": false
  }
]'::jsonb),
('crew', '[
  {
    "id": "shibin",
    "name": "Shibin Thomas",
    "role": "Diving Instructor | Team Leader | MSDT",
    "location": "Kerala",
    "experience": "0",
    "image": "/DIVERS/shibin.webp",
    "quote": "Teach with patience, lead with purpose, and trust the ocean to do the rest.",
    "highlights": [
      "Training architect",
      "Safety champion"
    ],
    "description": "Shibin is Scuba Spirit''s training architect and safety champion. His deep mastery of rescue, an uncanny ability to read student psychology, and a disciplined approach to systems and mentorship make him the center of the operation.",
    "skills": [
      "Advanced rescue techniques and emergency oxygen administration",
      "Behavioral detection: reading micro-signals of rising stress",
      "Curriculum design for modular instructor training",
      "Equipment inspection standards and maintenance workflows",
      "Crisis communication and mentorship"
    ],
    "certifications": [
      "PADI Dive Instructor (Teaching Certification)",
      "PADI Master Scuba Diver Trainer (MSDT)",
      "PADI Rescue Diver",
      "PADI Emergency First Response (EFR)",
      "PADI Open Water Diver",
      "PADI Advanced Open Water Diver"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "sikandar",
    "name": "Sikandar Hussain",
    "role": "Senior Specialty Instructor",
    "location": "India",
    "experience": "6+ years experience",
    "image": "/DIVERS/SikanderHussain.webp",
    "quote": "Master the fundamentals, respect the ocean, and the rest will follow.",
    "highlights": [
      "RAID Master Instructor",
      "PADI Master Scuba Diver Trainer",
      "International instructor training experience"
    ],
    "description": "Sikandar Hussain is a Senior Specialty Instructor known for his calm leadership, deep technical knowledge, and ability to guide divers through advanced training. With years of experience teaching specialty courses and mentoring divers, he focuses on building confidence, precision, and respect for the underwater environment.",
    "skills": [
      "Advanced diver training and mentorship",
      "Deep dive planning and safety supervision",
      "Underwater navigation training",
      "Dive equipment inspection and maintenance",
      "Rescue response and emergency management",
      "Student confidence development and coaching"
    ],
    "certifications": [
      "RAID Master Instructor",
      "PADI Master Scuba Diver Trainer (MSDT)",
      "PADI Open Water Scuba Instructor",
      "PADI Emergency First Response Instructor",
      "SSI Open Water Instructor (Course Completed)",
      "PADI Divemaster",
      "CMAS Diver"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "vijay",
    "name": "Vijay B. Harikanth",
    "role": "Dive Master",
    "location": "Murudeshwar",
    "experience": "1+ years experience",
    "image": "/DIVERS/vijay.webp",
    "quote": "Confidence underwater comes from preparation above water",
    "highlights": [
      "Orca whale encounter",
      "Pursuing Dive Master training"
    ],
    "description": "Once a local boat crew member, now a certified PADI Dive Master Vijay''s journey reflects growth built on experience and hard work.",
    "skills": [
      "Anchoring",
      "Boat balance",
      "Equipment setup",
      "Customer support",
      "Rescue training"
    ],
    "certifications": [
      "PADI Dive Master",
      "PADI Open Water Diver",
      "PADI Advanced Open Water Diver",
      "PADI Emergency First Responder (EFR)",
      "PADI Rescue Diver"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "amal",
    "name": "Amal",
    "role": "Dive Master",
    "location": "Kerala",
    "experience": "0",
    "image": "/DIVERS/amal.webp",
    "quote": "78% of the world is water — come explore the rest of your world.",
    "highlights": [
      "Calming nervous divers",
      "Underwater choreography"
    ],
    "description": "A compassionate guide with a dancer''s grace. His background in classical dance adds rhythm to his finning, and his calming approach makes him exceptional at coaching nervous or first-time divers.",
    "skills": [
      "Calming techniques for anxious divers",
      "Deep diving comfort and controlled ascent discipline",
      "Underwater choreography smooth finning and efficient movement",
      "Strong interpersonal communication and briefings"
    ],
    "certifications": [
      "PADI Dive Master",
      "PADI Open Water Diver",
      "PADI Advanced Open Water Diver",
      "PADI Emergency First Responder (EFR)",
      "PADI Rescue Diver"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "sreearaj",
    "name": "Sreearaj",
    "role": "Dive Master",
    "location": "Kerala",
    "experience": "0",
    "image": "/DIVERS/sreearaj.webp",
    "quote": "Always respect the ocean — it gave us life, and it keeps us alive.",
    "highlights": [
      "Breathwork coaching",
      "Spearfishing ethics advocate"
    ],
    "description": "A refined waterman: freediver, spearfisher, and scuba professional. His deep breath control, technical calm, and patient teaching make him ideal for advanced skills, breathwork coaching, and complex dives.",
    "skills": [
      "Breathwork coaching",
      "Advanced underwater navigation and site planning",
      "Efficient finning and energy-economy coaching",
      "Spearfishing awareness and sustainable harvest ethics",
      "Deep dive comfort and technical rescue basics"
    ],
    "certifications": [
      "PADI Dive Master",
      "PADI Open Water Diver",
      "PADI Advanced Open Water Diver",
      "PADI Emergency First Responder (EFR)",
      "PADI Rescue Diver"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "praveen",
    "name": "Praveen Francis Alphonse",
    "role": "Dive Master",
    "location": "India",
    "experience": "2+ years experience",
    "image": "/DIVERS/Praveen.webp",
    "quote": "Diving is therapy. Relax, trust the process, and enjoy being weightless.",
    "highlights": [
      "Whale Shark sighting",
      "Patient instructor for nervous divers"
    ],
    "description": "A calm-minded and patient diving professional, Anas began diving at 18 after encouragement from his brother. Today, he is known for his smooth buoyancy, gentle teaching style, and ability to comfort nervous beginners.",
    "skills": [
      "Buoyancy control",
      "Effective underwater communication",
      "Patient student handling",
      "Calm decision-making"
    ],
    "certifications": [
      "PADI Dive Master",
      "PADI Open Water Diver",
      "PADI Advanced Open Water Diver",
      "PADI Emergency First Responder (EFR)"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "ron",
    "name": "Ron",
    "role": "Dive Master",
    "location": "India",
    "experience": "2+ years experience",
    "image": "/DIVERS/RON.webp",
    "quote": "Discipline creates confidence — and confidence creates great divers.",
    "highlights": [
      "Experienced with sharks and mantas",
      "Excellent buoyancy control"
    ],
    "description": "A disciplined, technically sharp dive professional known for his mastery of buoyancy, calm underwater leadership, and deep experience with sharks, mantas, and other large marine animals.",
    "skills": [
      "Exceptional buoyancy and trim",
      "Professional underwater communication",
      "Strong situational awareness",
      "Leading dives in tougher currents",
      "Emergency execution including controlled ascents and air-sharing drills"
    ],
    "certifications": [
      "PADI Dive Master",
      "PADI Open Water Diver",
      "PADI Advanced Open Water Diver",
      "PADI Emergency First Responder (EFR)",
      "PADI Rescue Diver"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "jaykrishnan",
    "name": "Jaykrishnan",
    "role": "Dive Master",
    "location": "India",
    "experience": "2+ years experience",
    "image": "/DIVERS/Jaykrishnan.webp",
    "quote": "Stay calm, dive safe, and respect the ocean.",
    "highlights": [
      "Reliable dive leader",
      "Strong underwater awareness"
    ],
    "description": "Jaykrishnan is a skilled Dive Master known for his calm underwater presence and strong teamwork. With a disciplined approach to diving and a friendly personality, he helps divers feel comfortable while maintaining high safety standards during every dive.",
    "skills": [
      "Excellent buoyancy control",
      "Professional underwater communication",
      "Situational awareness and diver supervision",
      "Supporting instructors during training dives",
      "Emergency response readiness"
    ],
    "certifications": [
      "PADI Dive Master",
      "PADI Open Water Diver",
      "PADI Advanced Open Water Diver",
      "PADI Emergency First Responder (EFR)",
      "PADI Rescue Diver"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "bimal",
    "name": "Bimal",
    "role": "Dive Master",
    "location": "Kerala",
    "experience": "1+ years experience",
    "image": "/DIVERS/bimal.webp",
    "quote": "Eat. Sleep. Dive. Repeat.",
    "highlights": [
      "Sunrise dive with dolphins and manta",
      "30-second conservation clip shared by local tourism board"
    ],
    "description": "A fast-rising dive pro with infectious energy, beginner-friendly teaching style, and a passion for underwater storytelling. He''s the crew''s morale engine — a cook, singer, and content creator who pairs humor with serious safety awareness.",
    "skills": [
      "Beginner-friendly teaching",
      "Warm, approachable briefings",
      "Quick rigging & gear fault spotting",
      "Underwater communication and cueing",
      "Beginner rescue basics and emergency preparedness",
      "Basic underwater filming and sequencing for storytelling"
    ],
    "certifications": [
      "Beginner-friendly teaching",
      "Warm, approachable briefings",
      "Quick rigging & gear fault spotting",
      "Underwater communication and cueing",
      "Beginner rescue basics and emergency preparedness",
      "Basic underwater filming and sequencing for storytelling"
    ],
    "team": "Scuba Team"
  },
  {
    "id": "vittal",
    "name": "Vittal Harikant",
    "role": "Boat Captain",
    "location": "Murudeshwar",
    "experience": "10+ years experience",
    "image": "/DIVERS/vittalharikant.webp",
    "quote": "The sea teaches everything — patience, strength, and purpose.",
    "highlights": [
      "Captained Puneeth Rajkumar to Netrani",
      "10+ years experience as captain/engine driver"
    ],
    "description": "Vittal is a local boy from Murudeshwar and comes from a traditional fisherman family. Since childhood, he spent most of his time at sea, learning to handle boats, engines, and the rhythm of the waves from a very young age.",
    "skills": [
      "Expert boat handling & navigation",
      "Engine management",
      "Strong swimming & diving ability",
      "First aid & emergency response",
      "Assisting divers with gear",
      "Customer briefing & communication",
      "Understanding sea behavior & weather patterns"
    ],
    "certifications": [],
    "team": "Boat Staff"
  },
  {
    "id": "jeevan",
    "name": "Jeevan V. Harikant",
    "role": "Boat Staff | Kit-Up Specialist",
    "location": "Murudeshwar",
    "experience": "3+ years experience",
    "image": "/DIVERS/JEEVAN.webp",
    "quote": "Stay humble, stay grounded, and let the ocean teach you something new every day.",
    "highlights": [
      "Strong swimmer",
      "Kit-up specialist"
    ],
    "description": "Jeevan is a local boy from Murudeshwar, born into a fisherman family. He grew up watching his father and ancestors work at sea, which naturally built his interest in ocean-related activities and led him to the scuba diving industry.",
    "skills": [
      "Helping customers gear up",
      "Equipment checks before the dive",
      "Anchoring and removing the anchor",
      "Navigation support",
      "First-aid skills",
      "Emergency response",
      "Supporting divers entering/exiting the boat",
      "Strong swimmer"
    ],
    "certifications": [],
    "team": "Boat Staff"
  },
  {
    "id": "govardan",
    "name": "Govardan",
    "role": "Boat Staff | Kit-Up Specialist",
    "location": "Murudeshwar",
    "experience": "3+ years experience",
    "image": "/DIVERS/govardan.webp",
    "quote": "Respect the ocean and always support your team.",
    "highlights": [
      "Experienced kit-up specialist",
      "Well-known local face at Murudeshwar beach"
    ],
    "description": "Govardan is a local from Murudeshwar who has grown up around the sea and beach environment. Known for his friendly nature and strong work ethic, he plays an important role in preparing divers before they enter the water.",
    "skills": [
      "Experienced kit-up specialist",
      "Helping customers gear up",
      "Equipment inspection before dives",
      "Supporting divers entering/exiting the boat",
      "Boat preparation and dive logistics",
      "Strong swimming ability",
      "Basic first-aid knowledge",
      "Emergency response support"
    ],
    "certifications": [],
    "team": "Boat Staff"
  },
  {
    "id": "ganesh",
    "name": "Shree Ganesh Kumtakar",
    "role": "Ground Operations Associate",
    "location": "Shirali, Murdeshwara",
    "experience": "9+ years experience",
    "image": "/DIVERS/ganeshkumat.webp",
    "quote": "",
    "highlights": [
      "9+ years in dive industry",
      "MIS & Operations expert"
    ],
    "description": "Shree Ganesh Kumtakar works as a Ground Operations Associate, handling passenger services and coordinating turnaround scuba diving activities. With experience in both the dive industry and corporate operations, he ensures smooth and efficient guest handling every day.",
    "skills": [
      "Management Information Services (MIS Executive)",
      "Operational Risk Management (ORM)",
      "Team handling",
      "Customer service",
      "Basic Safety & Awareness",
      "Emergency Action Plan (EAP) procedures",
      "Fire extinguisher safety training",
      "Strong communication",
      "Quick decision-making",
      "Stress management"
    ],
    "certifications": [],
    "team": "Ground Staff"
  },
  {
    "id": "mohan",
    "name": "Mohan Naik",
    "role": "Ground Operations Associate",
    "location": "Murdeshwar, Karnataka",
    "experience": "3+ years experience",
    "image": "/DIVERS/Mohan.webp",
    "quote": "Work hard, help others, and respect the ocean.",
    "highlights": [
      "Friendly local guide for guests",
      "Reliable ground operations support"
    ],
    "description": "Mohan Naik is a friendly local from Murdeshwar who plays an important role in ground operations. Known for his helpful nature and strong work ethic, he assists guests throughout their diving journey from check-in to preparation ensuring a smooth and welcoming experience.",
    "skills": [
      "Guest assistance and coordination",
      "Handling dive equipment logistics",
      "Supporting divers during preparation",
      "Strong communication with guests",
      "Team coordination with boat and dive staff",
      "Basic safety awareness"
    ],
    "certifications": [],
    "team": "Ground Staff"
  },
  {
    "id": "prajwal",
    "name": "Prajwal Naik",
    "role": "Ground Operations Associate",
    "location": "Murdeshwar, Karnataka",
    "experience": "3+ years experience",
    "image": "/DIVERS/Prajwal.webp",
    "quote": "Stay strong. Stay humble. Dive deep.",
    "highlights": [
      "Known locally for his helpful nature around Murdeshwar",
      "Helps visitors explore Murdeshwar Temple and nearby spots",
      "Popular among guests for his friendly attitude and energy"
    ],
    "description": "Prajwal Jamindar is a friendly local from Murdeshwar who plays an important role in ground operations. Known for his energetic personality and helpful nature, he makes guests feel comfortable from the moment they arrive.",
    "skills": [
      "Local area knowledge of Murdeshwar",
      "Guest coordination and assistance",
      "Friendly communication with first-time divers",
      "Equipment preparation assistance",
      "Basic dive safety awareness",
      "Strong physical fitness and discipline from gym training"
    ],
    "certifications": [
      "Basic Dive Operations Training",
      "Guest Safety & Briefing Training",
      "Emergency Awareness Training"
    ],
    "team": "Ground Staff"
  }
]'::jsonb),
('galleryData', '[
  {
    "id": 1,
    "src": "/gallery/14 (1).webp",
    "alt": "Gallery image 1",
    "category": "Scenery",
    "caption": "Beautiful view from our location."
  },
  {
    "id": 2,
    "src": "/gallery/19.webp",
    "alt": "Gallery image 2",
    "category": "Scenery",
    "caption": "Stunning sunset moments."
  },
  {
    "id": 3,
    "src": "/gallery/DJI_20251228154718_0066_D.JPG.webp",
    "alt": "Aerial view",
    "category": "Scenery",
    "caption": "Aerial perspective of the coast."
  },
  {
    "id": 4,
    "src": "/gallery/DJI_20260105114007_0067_D.JPG.webp",
    "alt": "Aerial photo",
    "category": "Scenery",
    "caption": "Panoramic view of the ocean."
  },
  {
    "id": 5,
    "src": "/gallery/DJI_20260105114709_0036_D.JPG.webp",
    "alt": "Coastal landscape",
    "category": "Scenery",
    "caption": "Beautiful coastline views."
  },
  {
    "id": 6,
    "src": "/gallery/DJI_20260105122518_0188_D.JPG.webp",
    "alt": "Ocean view",
    "category": "Scenery",
    "caption": "Crystal clear waters."
  },
  {
    "id": 7,
    "src": "/gallery/DJI_20260109110436_0467_D.JPG.webp",
    "alt": "Drone shot",
    "category": "Scenery",
    "caption": "Aerial view of the beach."
  },
  {
    "id": 8,
    "src": "/gallery/DJI_20260114142245_0003_D.JPG.webp",
    "alt": "Drone capture",
    "category": "Scenery",
    "caption": "Scenic coastal landscape."
  },
  {
    "id": 9,
    "src": "/gallery/DJI_20260114161714_0045_D_013.JPG.webp",
    "alt": "Beach view",
    "category": "Scenery",
    "caption": "Tropical beach paradise."
  },
  {
    "id": 10,
    "src": "/gallery/DJI_20260117154034_0026_D.JPG.webp",
    "alt": "Aerial shot",
    "category": "Scenery",
    "caption": "Stunning coastal view."
  },
  {
    "id": 11,
    "src": "/gallery/DJI_20260120110200_0051_D.JPG.webp",
    "alt": "Ocean view",
    "category": "Scenery",
    "caption": "Beautiful sea and sky."
  },
  {
    "id": 12,
    "src": "/gallery/DJI_20260123104407_0082_D.JPG.webp",
    "alt": "Coastal view",
    "category": "Scenery",
    "caption": "Panoramic coastal scenery."
  },
  {
    "id": 13,
    "src": "/gallery/Screenshot 2026-02-18 194231.webp",
    "alt": "Gallery shot",
    "category": "Scenery",
    "caption": "A memorable view."
  },
  {
    "id": 14,
    "src": "/gallery/Screenshot 2026-02-20 070314.webp",
    "alt": "Another view",
    "category": "Scenery",
    "caption": "Amazing landscape."
  },
  {
    "id": 15,
    "src": "/gallery/WhatsApp Image 2026-03-10 at 8.42.17 PM (2).webp",
    "alt": "Photo from our trip",
    "category": "People",
    "caption": "Fun times at the beach."
  }
]'::jsonb),
('padiCourses', '[
  {
    "id": "discover-scuba",
    "title": "PADI Discover Scuba Diving",
    "description": "A supervised introduction to scuba diving that allows first-time participants to experience breathing underwater in a safe and controlled environment.",
    "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2670&auto=format&fit=crop",
    "details": {
      "duration": "1 day",
      "minimumAge": "10 years",
      "maximumDepth": "12m",
      "level": "Beginner"
    },
    "prerequisites": [
      "No prior diving experience required.",
      "Basic medical fitness is necessary."
    ],
    "whatYoullLearn": [
      "Understand basic scuba equipment and its usage",
      "Learn underwater hand signals and safety rules",
      "Experience weightlessness and controlled movement underwater",
      "Build confidence in shallow open water"
    ],
    "whatsIncluded": [
      "Scuba equipment orientation",
      "Safety briefing",
      "Confined or shallow water practice",
      "One instructor-led open water dive"
    ],
    "certification": "This is a PADI experience program and does not result in a certification.",
    "idealFor": [
      "First-time divers",
      "Non-certified participants",
      "Anyone curious about scuba diving"
    ]
  },
  {
    "id": "open-water",
    "title": "PADI Open Water Diver Course",
    "description": "The world''s most popular scuba certification program that teaches the core knowledge and skills needed to dive independently with a buddy anywhere in the world.",
    "image": "/60462-open water.webp",
    "details": {
      "duration": "3–4 days",
      "minimumAge": "10 years",
      "maximumDepth": "18m",
      "level": "Beginner"
    },
    "prerequisites": [
      "Basic swimming ability",
      "Medical clearance for diving"
    ],
    "whatYoullLearn": [
      "Learn scuba theory and dive safety principles",
      "Set up and use scuba equipment correctly",
      "Develop buoyancy and underwater communication skills",
      "Plan and conduct recreational dives safely"
    ],
    "whatsIncluded": [
      "Knowledge development sessions",
      "Confined water skill training",
      "Four open water dives",
      "Dive planning and safety procedures"
    ],
    "certification": "Participants earn a globally recognized PADI Open Water Diver certification.",
    "idealFor": [
      "New divers",
      "Travelers seeking worldwide certification",
      "Recreational diving enthusiasts"
    ]
  },
  {
    "id": "advanced-open-water",
    "title": "PADI Advanced Open Water Diver Course",
    "description": "Designed to improve confidence and build advanced diving skills through hands-on experience during guided adventure dives.",
    "image": "/advanced-open-watrer.webp",
    "details": {
      "duration": "2–3 days",
      "minimumAge": "12 years (Junior) / 15 years (Adult)",
      "maximumDepth": "21m (Junior) / 30m (Adult)",
      "level": "Intermediate"
    },
    "prerequisites": [
      "PADI Open Water Diver or equivalent certification."
    ],
    "whatYoullLearn": [
      "Increase depth limits safely",
      "Improve underwater navigation",
      "Enhance buoyancy and situational awareness",
      "Experience different types of diving"
    ],
    "whatsIncluded": [
      "Deep Adventure Dive (mandatory)",
      "Underwater Navigation Adventure Dive (mandatory)",
      "Three elective adventure dives (Night, Wreck, Drift, PPB, etc.)",
      "Instructor-guided practical training"
    ],
    "certification": "Successful completion results in a PADI Advanced Open Water Diver certification.",
    "idealFor": [
      "Certified Open Water Divers",
      "Divers seeking skill progression",
      "Those wanting deeper dive experiences"
    ]
  },
  {
    "id": "emergency-first-responder",
    "title": "PADI Emergency First Responder (EFR)",
    "description": "Teaches essential CPR and first aid skills for handling medical emergencies, both in diving and everyday situations.",
    "image": "/rescue.webp",
    "details": {
      "duration": "1–2 days",
      "minimumAge": "No age limit",
      "maximumDepth": "N/A",
      "level": "Beginner"
    },
    "prerequisites": [
      "None."
    ],
    "whatYoullLearn": [
      "Perform CPR confidently",
      "Provide primary and secondary care",
      "Handle injuries and medical emergencies",
      "Respond calmly in critical situations"
    ],
    "whatsIncluded": [
      "CPR training",
      "Primary and secondary care",
      "Injury assessment",
      "Emergency preparedness skills"
    ],
    "certification": "Participants receive a PADI Emergency First Responder certification.",
    "idealFor": [
      "Divers and non-divers",
      "Rescue Diver candidates",
      "Anyone wanting first aid knowledge"
    ]
  },
  {
    "id": "divemaster",
    "title": "PADI Divemaster Course",
    "description": "The first professional-level certification in recreational diving that develops leadership abilities and prepares divers to supervise activities and assist instructors.",
    "image": "/divemaster.webp",
    "details": {
      "duration": "2–4 weeks",
      "minimumAge": "18 years",
      "maximumDepth": "40m",
      "level": "Professional"
    },
    "prerequisites": [
      "PADI Rescue Diver certification",
      "EFR training",
      "Minimum logged dives"
    ],
    "whatYoullLearn": [
      "Develop professional-level dive knowledge",
      "Supervise certified divers",
      "Assist instructors during training",
      "Manage dive operations responsibly"
    ],
    "whatsIncluded": [
      "Leadership workshops",
      "Dive theory development",
      "Skill demonstrations",
      "Instructor assistance training",
      "Eligibility for professional PADI membership"
    ],
    "certification": "Successful candidates earn a PADI Divemaster certification.",
    "idealFor": [
      "Aspiring dive professionals",
      "Career-focused divers",
      "Leadership-oriented individuals"
    ]
  }
]'::jsonb),
('roomsData', '{
  "deluxe-sea-view": {
    "id": "deluxe-sea-view",
    "title": "Deluxe Sea View Room",
    "sizeBadge": "450 sq.ft",
    "subtitle": "Wake up to the breathtaking sight of the Arabian Sea and refreshing coastal breeze",
    "images": {
      "interior": "/Photos/DSC_3974.JPG",
      "balcony": "/Photos/DSC_0467.JPG",
      "amenities": "/Photos/DSC_3976.JPG"
    },
    "overlayBadges": [
      "King Bed",
      "Private Balcony",
      "Sea View"
    ],
    "idealFor": [
      "Honeymooners",
      "Ocean Lovers",
      "Photographers",
      "Luxury Seekers"
    ],
    "mainTitle": "About This Room",
    "description": [
      "The Deluxe Sea View Room at our resort in Murdeshwar provides an unparalleled comfort and coastal elegance to the visitors who wish to wake up to a wonderful sight of the sea and refreshing sea breeze. The room provides a peaceful and serene environment where you can have a wonderful experience of beach view, and Murudeshwar temple making it a best sea view room in Murdeshwar.",
      "Our 450 sq. ft. Deluxe Sea View Room has a spacious floor plan, a comfortable king-size bed, and excellent bedding to ensure a comfortable night''s rest. The warm light, luxurious furniture, and modern style are also responsible for the excellent design of the room and soothing feel. For people preferring a beautiful setting, the room''s spacious window or private balcony allows plenty of natural light to flood the room and offers a full-on sight of the ocean, thus being the best ocean view room at Murdeshwar."
    ],
    "bookingCard": {
      "priceTitle": "Premium Sea View",
      "priceSubText": "Starting from",
      "bullets": [
        "Free cancellation available",
        "Breakfast optional",
        "Instant confirmation",
        "Best value for money"
      ]
    },
    "highlights": [
      {
        "title": "Perfect for Families",
        "desc": "Ideal space for small families seeking comfort and convenience during their stay.",
        "icon": "users"
      },
      {
        "title": "Business Ready",
        "desc": "Modern amenities and free Wi-Fi perfect for business travelers.",
        "icon": "briefcase"
      },
      {
        "title": "Home Away From Home",
        "desc": "Cozy and welcoming atmosphere designed to make you feel at home.",
        "icon": "home"
      }
    ],
    "whyChoose": [
      {
        "title": "Perfect Price-to-Comfort Ratio",
        "desc": "Get all the essential amenities without breaking the bank - ideal for budget-conscious travelers."
      },
      {
        "title": "Highest Cleanliness Standards",
        "desc": "All accommodations are maintained to a higher standard of cleanliness by our dedicated housekeeping staff."
      },
      {
        "title": "Dedicated Staff Assistance",
        "desc": "Our staff is ever ready to assist you with whatever you need - from arranging tours to providing travel information."
      },
      {
        "title": "Create Memorable Experiences",
        "desc": "Experience the best possible mix of comfort, value, and personal care for memories that last a lifetime."
      }
    ],
    "amenities": [
      {
        "name": "King-size Bed",
        "desc": "Restful sleep",
        "icon": "bed"
      },
      {
        "name": "Free Wi-Fi",
        "desc": "High-speed internet",
        "icon": "wifi"
      },
      {
        "name": "Mineral Water",
        "desc": "Complimentary",
        "icon": "droplet"
      },
      {
        "name": "Housekeeping",
        "desc": "Daily service",
        "icon": "home"
      },
      {
        "name": "Breakfast",
        "desc": "Optional",
        "icon": "coffee"
      },
      {
        "name": "Free Toiletries",
        "desc": "Premium quality",
        "icon": "sparkles"
      },
      {
        "name": "Balcony",
        "desc": "Sunrise & sunset views",
        "icon": "layout"
      },
      {
        "name": "Room Service",
        "desc": "At your convenience",
        "icon": "bell"
      }
    ]
  },
  "deluxe-double": {
    "id": "deluxe-double",
    "title": "Deluxe Double Room",
    "sizeBadge": "400 sq.ft",
    "subtitle": "Experience the perfect mix of comfort, style, and natural beauty",
    "images": {
      "interior": "/Photos/DSC_3958.JPG",
      "balcony": "/Photos/DSC_0470.JPG",
      "amenities": "/Photos/DSC_3960.JPG"
    },
    "overlayBadges": [
      "Double Bed",
      "Private Balcony",
      "Beach View"
    ],
    "idealFor": [
      "Families",
      "Couples",
      "Explorers",
      "Staycations"
    ],
    "mainTitle": "About This Room",
    "description": [
      "Our Deluxe Double Room is tailored for travelers who desire comfortable beachfront living. Step out onto your balcony and feel the cool Arabian Sea breeze and warm coastal atmosphere.",
      "Spanning 400 sq. ft., this room contains premium double bedding and sits surrounded by the stunning landscapes of Murudeshwar. Elegant decor details and soft warm lights establish a peaceful, restful atmosphere."
    ],
    "bookingCard": {
      "priceTitle": "Deluxe Room",
      "priceSubText": "Starting from",
      "bullets": [
        "Free cancellation available",
        "Breakfast optional",
        "Instant confirmation",
        "Best value for money"
      ]
    },
    "highlights": [
      {
        "title": "Perfect for Families",
        "desc": "Ideal space for small families seeking comfort and convenience during their stay.",
        "icon": "users"
      },
      {
        "title": "Business Ready",
        "desc": "Modern amenities and free Wi-Fi perfect for business travelers.",
        "icon": "briefcase"
      },
      {
        "title": "Home Away From Home",
        "desc": "Cozy and welcoming atmosphere designed to make you feel at home.",
        "icon": "home"
      }
    ],
    "whyChoose": [
      {
        "title": "Perfect Price-to-Comfort Ratio",
        "desc": "Get all the essential amenities without breaking the bank - ideal for budget-conscious travelers."
      },
      {
        "title": "Highest Cleanliness Standards",
        "desc": "All accommodations are maintained to a higher standard of cleanliness by our dedicated housekeeping staff."
      },
      {
        "title": "Dedicated Staff Assistance",
        "desc": "Our staff is ever ready to assist you with whatever you need - from arranging tours to providing travel information."
      },
      {
        "title": "Create Memorable Experiences",
        "desc": "Experience the best possible mix of comfort, value, and personal care for memories that last a lifetime."
      }
    ],
    "amenities": [
      {
        "name": "Double Bed",
        "desc": "Restful sleep",
        "icon": "bed"
      },
      {
        "name": "Free Wi-Fi",
        "desc": "High-speed internet",
        "icon": "wifi"
      },
      {
        "name": "Mineral Water",
        "desc": "Complimentary",
        "icon": "droplet"
      },
      {
        "name": "Housekeeping",
        "desc": "Daily service",
        "icon": "home"
      },
      {
        "name": "Breakfast",
        "desc": "Optional",
        "icon": "coffee"
      },
      {
        "name": "Free Toiletries",
        "desc": "Premium quality",
        "icon": "sparkles"
      },
      {
        "name": "Balcony",
        "desc": "Sunrise & sunset views",
        "icon": "layout"
      },
      {
        "name": "Room Service",
        "desc": "At your convenience",
        "icon": "bell"
      }
    ]
  },
  "standard-double": {
    "id": "standard-double",
    "title": "Standard Double Room",
    "sizeBadge": "350 sq.ft",
    "subtitle": "Comfortable stay with modern amenities - your home away from home in Murdeshwar",
    "images": {
      "interior": "/Photos/DSC_3854.JPG",
      "balcony": "/Photos/DSC_0425.JPG",
      "amenities": "/Photos/DSC_0437.JPG"
    },
    "overlayBadges": [
      "Queen Bed",
      "Private Balcony",
      "Free Wi-Fi"
    ],
    "idealFor": [
      "Solo Travelers",
      "Business Trips",
      "Small Families",
      "Weekend Getaways"
    ],
    "mainTitle": "About This Room",
    "description": [
      "Our 350 sq. ft. Standard Double Room can be the perfect choice for the solo traveler, business traveler, and small families who are seeking comfort and convenience. These rooms are filled with modern amenities and have a cozy and welcoming atmosphere. Whether you are visiting for leisure, a business trip, or a peaceful getaway, our rooms make you feel like you''re at home away from home.",
      "Our room contains amenities like one queen-size bed, ensuring your rejuvenating sleep to make you feel fresh every day; mineral water; free Wi-Fi; housekeeping services to ensure the cleanliness in your surroundings; breakfast, which is optional; etc., including the free toiletries in the en-suite bathrooms attached to the rooms. With our rooms you will get the attached balcony so you can enjoy the beautiful sunrise and sunset during your stay here."
    ],
    "bookingCard": {
      "priceTitle": "Budget Friendly",
      "priceSubText": "Starting from",
      "bullets": [
        "Free cancellation available",
        "Breakfast optional",
        "Instant confirmation",
        "Best value for money"
      ]
    },
    "highlights": [
      {
        "title": "Perfect for Families",
        "desc": "Ideal space for small families seeking comfort and convenience during their stay.",
        "icon": "users"
      },
      {
        "title": "Business Ready",
        "desc": "Modern amenities and free Wi-Fi perfect for business travelers.",
        "icon": "briefcase"
      },
      {
        "title": "Home Away From Home",
        "desc": "Cozy and welcoming atmosphere designed to make you feel at home.",
        "icon": "home"
      }
    ],
    "whyChoose": [
      {
        "title": "Perfect Price-to-Comfort Ratio",
        "desc": "Get all the essential amenities without breaking the bank - ideal for budget-conscious travelers."
      },
      {
        "title": "Highest Cleanliness Standards",
        "desc": "All accommodations are maintained to a higher standard of cleanliness by our dedicated housekeeping staff."
      },
      {
        "title": "Dedicated Staff Assistance",
        "desc": "Our staff is ever ready to assist you with whatever you need - from arranging tours to providing travel information."
      },
      {
        "title": "Create Memorable Experiences",
        "desc": "Experience the best possible mix of comfort, value, and personal care for memories that last a lifetime."
      }
    ],
    "amenities": [
      {
        "name": "Queen-size Bed",
        "desc": "Restful sleep",
        "icon": "bed"
      },
      {
        "name": "Free Wi-Fi",
        "desc": "High-speed internet",
        "icon": "wifi"
      },
      {
        "name": "Mineral Water",
        "desc": "Complimentary",
        "icon": "droplet"
      },
      {
        "name": "Housekeeping",
        "desc": "Daily service",
        "icon": "home"
      },
      {
        "name": "Breakfast",
        "desc": "Optional",
        "icon": "coffee"
      },
      {
        "name": "Free Toiletries",
        "desc": "Premium quality",
        "icon": "sparkles"
      },
      {
        "name": "Balcony",
        "desc": "Sunrise & sunset views",
        "icon": "layout"
      },
      {
        "name": "Room Service",
        "desc": "At your convenience",
        "icon": "bell"
      }
    ]
  }
}'::jsonb),
('services', '[
  {
    "title": "Scuba Diving",
    "description": "Discover the underwater world with our certified PADI courses and guided dives. We offer everything from beginner experiences to professional-level training.",
    "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2670&auto=format&fit=crop",
    "dark": true,
    "link": "/courses",
    "courses": [
      {
        "name": "PADI Discover Scuba Diving",
        "duration": "1 day",
        "level": "Beginner"
      },
      {
        "name": "PADI Open Water Diver",
        "duration": "3-4 days",
        "level": "Beginner"
      },
      {
        "name": "PADI Advanced Open Water",
        "duration": "2-3 days",
        "level": "Intermediate"
      }
    ]
  },
  {
    "title": "Beach-Front Stay",
    "description": "Wake up to the sound of waves in our exclusive beach-front accommodations with private terraces and ocean views.",
    "image": "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=3432&auto=format&fit=crop",
    "dark": true,
    "link": "/beach-front-stay"
  },
  {
    "title": "Cab Rental Services",
    "description": "Comfortable taxi & sightseeing services by Naik Tour and Travels. Local tours, outstation trips, airport transfers, and 24×7 taxi availability.",
    "image": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2670&auto=format&fit=crop",
    "dark": true,
    "accent": true,
    "link": "/cab-rental"
  },
  {
    "title": "Bike Rental Services",
    "description": "Explore Murudeshwar at your own pace with our premium Royal Enfield motorbikes & scooters. We offer cruiser bikes and cruisers for every trail.",
    "image": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2670&auto=format&fit=crop",
    "dark": true,
    "link": "/bike-rental"
  }
]'::jsonb),
('travelData', '[
  {
    "id": "santorini",
    "title": "Santorini Dreams",
    "subtitle": "Mediterranean luxury awaits",
    "videoPath": "/videos/santorini-hero.mp4",
    "stats": "From $4,500 | 7 nights",
    "size": "large",
    "description": "Experience the golden hour over the caldera."
  },
  {
    "id": "tropical",
    "title": "Tropical Paradise",
    "subtitle": "Island escapes",
    "videoPath": "/videos/tropical-sunset-palms.mp4",
    "stats": "From $3,200 | 5 nights",
    "size": "medium",
    "description": "Relax with palm silhouettes and ocean breezes."
  },
  {
    "id": "first-class",
    "title": "First-Class Journey",
    "subtitle": "Fly in style",
    "videoPath": "/videos/champagne-bubbles.mp4",
    "stats": "Upgrade from $1,200",
    "size": "medium",
    "description": "Sip champagne at 30,000 feet."
  },
  {
    "id": "aviation",
    "title": "Sky High Adventures",
    "subtitle": "World awaits",
    "videoPath": "/videos/wing-golden-hour.mp4",
    "stats": "150+ Cities",
    "size": "wide",
    "description": "Explore the world with seamless connections."
  },
  {
    "id": "penthouse",
    "title": "Penthouse Keycard",
    "subtitle": "Exclusive Access",
    "videoPath": "/videos/penthouse.mp4",
    "stats": "Elite Members Only",
    "size": "medium",
    "description": "Unlocking the ultimate luxury experience."
  }
]'::jsonb),
('destinations', '[
  {
    "id": "kyoto",
    "title": "Kyoto Ancient Stays",
    "location": "Japan",
    "price": "$8,500",
    "description": "Immerse yourself in the tranquility of ancient temples and bamboo forests. Private tea ceremonies included.",
    "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop"
  },
  {
    "id": "amalfi",
    "title": "Amalfi Coast Villa",
    "location": "Italy",
    "price": "$12,000",
    "description": "Cliffside luxury overlooking the Tyrrhenian Sea. Private yacht tours and lemon grove tastings.",
    "image": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2666&auto=format&fit=crop"
  },
  {
    "id": "aspen",
    "title": "Aspen Winter Chalet",
    "location": "USA",
    "price": "$15,000",
    "description": "Ski-in/ski-out access with a private chef and heated outdoor pool.",
    "image": "https://images.unsplash.com/photo-1518182170546-07fb612d21e3?q=80&w=2670&auto=format&fit=crop"
  },
  {
    "id": "mykonos",
    "title": "Mykonos White House",
    "location": "Greece",
    "price": "$10,500",
    "description": "Iconic white aesthetics with a private infinity pool facing the sunset.",
    "image": "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed2a?q=80&w=2574&auto=format&fit=crop"
  },
  {
    "id": "bali",
    "title": "Ubud Jungle Resort",
    "location": "Indonesia",
    "price": "$6,200",
    "description": "Suspended infinity pools in the heart of the rainforest. Yoga and wellness retreats.",
    "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2676&auto=format&fit=crop"
  },
  {
    "id": "reykjavik",
    "title": "Northern Lights Igloo",
    "location": "Iceland",
    "price": "$7,800",
    "description": "Glass-roofed luxury pods designed for the ultimate aurora borealis viewing experience.",
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2670&auto=format&fit=crop"
  }
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Create leads table (CRM bookings and inquiries)
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON leads;
DROP POLICY IF EXISTS "Allow public insert" ON leads;
DROP POLICY IF EXISTS "Allow public update" ON leads;
DROP POLICY IF EXISTS "Allow public delete" ON leads;

CREATE POLICY "Allow public read" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON leads FOR DELETE USING (true);
