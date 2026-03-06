-- Insert sample education data for Umasha Parami Abekoon
INSERT INTO education (degree, institution, location, start_date, end_date, is_current, grade, description, activities) VALUES
(
  'B. Design (Fashion Design & Product Development)',
  'University of Moratuwa',
  'Moratuwa, Sri Lanka',
  '2020-08-01',
  '2024-06-01',
  false,
  'Expected Graduation: June 2024',
  'Specialized in apparel design, textiles, and product development. Academic focus: consumer research, fashion marketing, sustainable practices, and creative design solutions.',
  ARRAY['MORA Lenze (Mass Media Club of UoM)', 'Classical Music Society of UoM']
),
(
  'Advanced Level (Commerce Stream)',
  'Vishvoda College',
  'Kurunegala, Sri Lanka',
  '2020-08-01',
  '2023-01-01',
  false,
  '2A''s, 1B (GPA: 1.1918)',
  'Commerce stream with focus on business studies and economics.',
  ARRAY['School Prefect Board', 'School Media Unit', 'Junior Prefect']
),
(
  'Ordinary Level',
  'Wickramahila National School',
  'Sri Lanka',
  '2015-01-01',
  '2019-12-01',
  false,
  '6A''s, 1B, 2C''s',
  'Completed secondary education with strong academic performance.',
  ARRAY['Junior Prefect Board', 'School Media Unit', 'School Chess Team']
),
(
  'Diploma in English and Information Technology',
  'IMBS Green University',
  'Sri Lanka',
  '2019-01-01',
  '2020-06-01',
  false,
  null,
  'Focus on IT skills and professional English communication.',
  ARRAY[]
);

-- Insert sample skills data
INSERT INTO skills (name, category, proficiency) VALUES
('Fashion Design', 'Design', 5),
('Textile Design', 'Design', 4),
('Batik Art', 'Craft', 4),
('Handloom Weaving', 'Craft', 3),
('Apparel Product Development', 'Design', 4),
('Microsoft PowerPoint', 'Technical', 4),
('Data Entry', 'Technical', 3),
('Social Media Management', 'Communication', 4),
('Public Speaking', 'Communication', 4),
('Event Coordination', 'Leadership', 4),
('Team Leadership', 'Leadership', 4),
('Project Management', 'Leadership', 3);

-- Insert sample projects data
INSERT INTO projects (title, description, long_description, category, tags, image_url, featured, order_index) VALUES
(
  'Exploring Batik Art',
  'Experimental Batik pieces through traditional waxing and dyeing techniques',
  'Created experimental Batik pieces through waxing and dyeing at Bhuddi Batik Workshop. Developed resilience and creativity by turning mistakes into unique outcomes. This project taught me how unexpected results can lead to meaningful designs and strengthened my understanding of traditional Sri Lankan textile arts.',
  'Textile Art',
  ARRAY['Batik', 'Traditional Craft', 'Textile Design', 'Cultural Heritage'],
  '/placeholder.svg?height=400&width=600',
  true,
  1
),
(
  'Handloom Weaving Workshop',
  'Traditional weaving techniques learned at Katubedda Weaving Centre',
  'Hands-on learning in traditional weaving with guidance from the Textile Department, UoM at Katubedda Weaving Centre. Gained experience in thread fixing, weaving patterns, and innovative textile design. This collaborative work with peers fostered creativity, patience, and deep appreciation for traditional craftsmanship.',
  'Textile Art',
  ARRAY['Handloom', 'Weaving', 'Traditional Craft', 'Collaboration'],
  '/placeholder.svg?height=400&width=600',
  true,
  2
),
(
  'Sustainable Fashion Workshop',
  'Immersive experience in sustainable Batik processes and eco-friendly design',
  'Participated in Buddhi Batiks Workshop focusing on sustainable fashion and craft practices. Immersed in traditional Batik processes: drawing, waxing, dyeing, and finishing. This experience highlighted the crucial links between craftsmanship, culture, and sustainability, strengthening my knowledge of eco-friendly and heritage-driven design practices.',
  'Sustainable Design',
  ARRAY['Sustainability', 'Batik', 'Eco-friendly', 'Cultural Heritage'],
  '/placeholder.svg?height=400&width=600',
  true,
  3
),
(
  'Fashion Product Development',
  'Academic projects in apparel design and product development',
  'Series of academic projects focusing on fashion product development, consumer research, and market analysis. These projects involved creating comprehensive design solutions that address modern fashion challenges while incorporating sustainable practices and cultural elements.',
  'Product Development',
  ARRAY['Fashion Design', 'Product Development', 'Market Research', 'Innovation'],
  '/placeholder.svg?height=400&width=600',
  false,
  4
);

-- Insert sample experiences data
INSERT INTO experiences (title, organization, location, start_date, end_date, is_current, description, achievements) VALUES
(
  'Fashion Design Student',
  'University of Moratuwa',
  'Moratuwa, Sri Lanka',
  '2020-08-01',
  '2024-06-01',
  false,
  'Pursuing Bachelor of Design in Fashion Design & Product Development with focus on sustainable practices and cultural heritage preservation.',
  ARRAY['Active member of MORA Lenze (Mass Media Club)', 'Member of Classical Music Society', 'Participated in multiple textile workshops', 'Developed expertise in traditional Sri Lankan crafts']
),
(
  'Junior Prefect',
  'Vishvoda College',
  'Kurunegala, Sri Lanka',
  '2021-01-01',
  '2022-12-01',
  false,
  'Served as Junior Prefect developing leadership skills, responsibility, and event organization capabilities.',
  ARRAY['Led school media unit activities', 'Organized cultural events', 'Mentored junior students', 'Developed strong communication skills']
),
(
  'Media Unit Member',
  'Wickramahila National School',
  'Sri Lanka',
  '2017-01-01',
  '2019-12-01',
  false,
  'Active member of school media unit and chess team, developing communication and strategic thinking skills.',
  ARRAY['Participated in inter-school competitions', 'Developed public speaking skills', 'Led media coverage of school events']
);
