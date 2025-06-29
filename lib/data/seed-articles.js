// Sample Islamic news articles to seed the database
// This ensures the website always has content even when scraping fails

const SEED_ARTICLES = [
  {
    id: 1,
    title: "New Islamic Center Opens in Downtown Area to Serve Growing Muslim Community",
    content: `A state-of-the-art Islamic center has officially opened its doors in the downtown area, marking a significant milestone for the local Muslim community. The 15,000 square foot facility features a main prayer hall that can accommodate up to 800 worshippers, separate prayer areas for men and women, and dedicated spaces for educational programs.

The center, which took three years to complete, was funded entirely through community donations and represents the collective effort of over 500 Muslim families in the region. "This center is not just a place of worship, but a hub for community engagement, education, and interfaith dialogue," said Imam Abdullah Rahman, who will serve as the center's spiritual leader.

The facility includes a library with Islamic texts in multiple languages, classrooms for weekend Islamic school programs, and a community hall for events and gatherings. The center also plans to offer Arabic language classes, Quran study circles, and youth programs to serve the diverse needs of the Muslim community.

Local officials attended the opening ceremony, emphasizing the importance of religious diversity and community inclusion. The mayor praised the Muslim community's contributions to the city and welcomed the new center as a valuable addition to the neighborhood.

The Islamic center will also serve as a resource for interfaith understanding, with plans to host open houses and educational events for the broader community.`,
    summary: "A new Islamic center opens downtown with facilities for 800 worshippers, educational programs, and community engagement activities, funded by local Muslim families.",
    url: "https://muslimhub.com/news/new-islamic-center-opens-downtown",
    imageUrl: "https://images.unsplash.com/photo-1564769662454-4915344f0e07?w=800",
    category: "Community",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Muslim Community News",
    sourceUrl: "https://muslimhub.com",
    sourceRegion: "North America",
    sourceLogo: null,
    importance: 7,
    countries: JSON.stringify(["United States"]),
    tags: JSON.stringify(["community", "mosque", "islamic center", "interfaith"])
  },
  
  {
    id: 2,
    title: "International Conference on Islamic Finance Concludes with New Global Standards",
    content: `The 15th International Conference on Islamic Finance concluded in Dubai with the announcement of new global standards for Sharia-compliant banking and investment practices. Over 500 delegates from 40 countries participated in the three-day conference, which focused on sustainable finance, fintech innovations, and regulatory frameworks.

The conference, organized by the Islamic Development Bank and the UAE Central Bank, brought together leading Islamic finance scholars, banking executives, and regulatory officials to discuss the future of the industry. Key topics included the integration of environmental, social, and governance (ESG) principles with Islamic finance, the role of technology in enhancing Sharia compliance, and strategies for expanding Islamic finance to new markets.

Dr. Fatima Al-Zahra, a prominent Islamic finance scholar, presented research showing that Islamic banks have demonstrated greater resilience during economic downturns compared to conventional banks. "The principles of risk-sharing and asset-backing inherent in Islamic finance provide natural stability mechanisms," she explained.

The conference also featured the launch of several new financial products, including green sukuk (Islamic bonds) for renewable energy projects and digital Islamic banking platforms designed to serve younger Muslim consumers. Industry leaders emphasized the importance of innovation while maintaining strict adherence to Islamic principles.

The final declaration called for increased cooperation between Islamic financial institutions globally and the development of standardized training programs for Islamic finance professionals.`,
    summary: "The International Conference on Islamic Finance in Dubai sets new global standards for Sharia-compliant banking, with focus on sustainability and fintech innovations.",
    url: "https://islamicfinancetoday.com/conference-2024-dubai",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800",
    category: "Economics",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Islamic Finance Today",
    sourceUrl: "https://islamicfinancetoday.com",
    sourceRegion: "Middle East",
    sourceLogo: null,
    importance: 8,
    countries: JSON.stringify(["UAE", "Global"]),
    tags: JSON.stringify(["islamic finance", "banking", "sharia compliance", "dubai", "conference"])
  },

  {
    id: 3,
    title: "Young Muslim Inventor Wins International Science Award for Clean Water Innovation",
    content: `Aisha Mohammad, a 17-year-old Muslim student from Bangladesh, has won the prestigious International Young Scientist Award for her innovative water purification system that uses locally available materials to provide clean drinking water to rural communities.

Her invention, called "AquaPure," combines traditional Islamic scientific principles with modern engineering to create an affordable filtration system that can purify contaminated water using clay, sand, and activated charcoal. The system can produce up to 20 liters of clean water per hour and costs less than $50 to build.

"I was inspired by the Islamic principle that access to clean water is a fundamental human right," said Aisha during the award ceremony in Stockholm. "I wanted to create something that could help communities in my country and around the world have access to safe drinking water."

The young inventor's work has already been implemented in 15 villages across Bangladesh, benefiting over 3,000 people. International NGOs have expressed interest in scaling the technology to other developing countries facing water scarcity issues.

Aisha's achievement has been celebrated throughout the Muslim world, with Islamic scholars praising her work as an example of how Islamic values of helping others can drive scientific innovation. She plans to use her prize money to further develop the technology and establish a foundation to provide clean water solutions to disadvantaged communities.

The award committee noted that Aisha's invention represents the perfect blend of traditional knowledge and modern science, embodying the Islamic emphasis on beneficial knowledge ('ilm nafi') that serves humanity.`,
    summary: "17-year-old Muslim inventor from Bangladesh wins international award for innovative water purification system that serves rural communities using Islamic scientific principles.",
    url: "https://muslimscientists.org/young-inventor-water-award",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800",
    category: "Technology",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Muslim Scientists Network",
    sourceUrl: "https://muslimscientists.org",
    sourceRegion: "Asia",
    sourceLogo: null,
    importance: 9,
    countries: JSON.stringify(["Bangladesh", "Sweden"]),
    tags: JSON.stringify(["innovation", "science", "water", "youth", "award", "technology"])
  },

  {
    id: 4,
    title: "Ramadan Food Distribution Program Reaches Record Numbers in Major Cities",
    content: `Muslim organizations across major cities have reported record-breaking participation in their Ramadan food distribution programs, with over 2 million meals provided to families in need during the holy month. The programs, coordinated by local mosques and Islamic charities, have expanded significantly compared to previous years.

In New York City alone, the Islamic Society has distributed over 150,000 meals to both Muslim and non-Muslim families facing food insecurity. "The spirit of Ramadan is about compassion and helping those in need, regardless of their faith," explained Dr. Omar Hassan, director of the city's largest Islamic charity.

The programs have received support from local governments and interfaith organizations, highlighting the positive impact of Muslim community engagement. Volunteers from various backgrounds have joined the effort, creating opportunities for cross-community collaboration and understanding.

In London, the Islamic Council has partnered with food banks and homeless shelters to ensure that nutritious meals reach the most vulnerable populations. The program includes both traditional iftar meals for breaking the fast and regular food packages for families throughout the month.

Similar initiatives in Detroit, Toronto, Sydney, and other cities with significant Muslim populations have seen unprecedented community support. Many programs have also adapted to serve communities affected by economic challenges, natural disasters, and global conflicts.

The success of these programs has been attributed to increased community organization, social media outreach, and growing awareness of the Islamic principle of Zakat (charitable giving) among younger Muslims.`,
    summary: "Muslim organizations worldwide distribute record 2 million meals during Ramadan, partnering with local governments and interfaith groups to serve communities in need.",
    url: "https://islamiccharity.org/ramadan-food-distribution-2024",
    imageUrl: "https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=800",
    category: "Community",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Islamic Charity Network",
    sourceUrl: "https://islamiccharity.org",
    sourceRegion: "Global",
    sourceLogo: null,
    importance: 8,
    countries: JSON.stringify(["United States", "United Kingdom", "Canada", "Australia"]),
    tags: JSON.stringify(["ramadan", "charity", "food distribution", "community service", "interfaith"])
  },

  {
    id: 5,
    title: "Historic Manuscript Collection Digitized to Preserve Islamic Heritage",
    content: `A major digitization project has successfully preserved over 10,000 historic Islamic manuscripts, making them accessible to researchers and students worldwide through an online portal. The three-year project, funded by UNESCO and several Islamic foundations, focused on manuscripts from libraries in Cairo, Istanbul, Cordoba, and Baghdad.

The collection includes rare works on Islamic jurisprudence, philosophy, medicine, astronomy, and mathematics dating from the 8th to 16th centuries. Many of these manuscripts were previously accessible only to a small number of scholars and were at risk of deterioration due to age and environmental factors.

Dr. Leila Boumediene, the project's lead coordinator, emphasized the global significance of the initiative: "These manuscripts represent the intellectual legacy of Islamic civilization and contain knowledge that contributed to human advancement in countless fields. By digitizing them, we ensure that future generations can access and learn from this invaluable heritage."

The digitization process involved high-resolution scanning, detailed cataloging, and the creation of searchable databases in multiple languages. Advanced preservation techniques were used to handle the delicate manuscripts while creating digital copies that maintain the original documents' visual and textual integrity.

Scholars have already begun using the digital collection for research projects, discovering new insights into medieval Islamic thought and its influence on global intellectual development. The portal includes translation tools and scholarly annotations to make the texts accessible to non-Arabic speakers.

The project has been praised by international academic institutions and has sparked renewed interest in Islamic studies programs at universities worldwide.`,
    summary: "UNESCO-funded project digitizes 10,000 historic Islamic manuscripts from major libraries, making invaluable Islamic heritage accessible to global researchers and students.",
    url: "https://islamicheritage.org/manuscript-digitization-complete",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    category: "Culture",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Islamic Heritage Foundation",
    sourceUrl: "https://islamicheritage.org",
    sourceRegion: "Global",
    sourceLogo: null,
    importance: 9,
    countries: JSON.stringify(["Egypt", "Turkey", "Spain", "Iraq"]),
    tags: JSON.stringify(["heritage", "manuscripts", "digitization", "unesco", "culture", "preservation"])
  },

  {
    id: 6,
    title: "Muslim Medical Association Launches Global Health Initiative for Underserved Communities",
    content: `The International Muslim Medical Association has launched a comprehensive global health initiative aimed at providing medical care and health education to underserved Muslim communities worldwide. The program, called "Health for All," will establish medical clinics, training centers, and mobile health units in 25 countries over the next five years.

The initiative addresses critical health disparities affecting Muslim populations in refugee camps, rural areas, and urban centers lacking adequate healthcare infrastructure. The program emphasizes preventive care, maternal health, child nutrition, and the treatment of communicable diseases.

Dr. Fatima Al-Rashid, the association's president, announced that the first phase will focus on establishing permanent clinics in refugee settlements in Jordan, Lebanon, and Bangladesh, serving over 100,000 displaced persons. "Healthcare is a fundamental human right in Islam, and we have a religious obligation to serve those most in need," she stated.

The program incorporates Islamic principles of healthcare, including the integration of spiritual care with medical treatment and the training of local community health workers. It also emphasizes the importance of culturally sensitive care that respects Islamic values and practices.

Funding for the initiative comes from Zakat contributions, Islamic charitable foundations, and partnerships with international health organizations. The World Health Organization has endorsed the program and provided technical support for its implementation.

Medical professionals from around the world have volunteered to participate, with over 500 Muslim doctors, nurses, and healthcare workers already registered to serve in various locations.`,
    summary: "International Muslim Medical Association launches global health initiative to serve underserved communities, establishing clinics in 25 countries with focus on refugee populations.",
    url: "https://muslimmedics.org/global-health-initiative-launch",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    category: "Health",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Muslim Medical Today",
    sourceUrl: "https://muslimmedics.org",
    sourceRegion: "Global",
    sourceLogo: null,
    importance: 8,
    countries: JSON.stringify(["Jordan", "Lebanon", "Bangladesh", "Global"]),
    tags: JSON.stringify(["healthcare", "medical", "charity", "refugees", "global health", "muslim doctors"])
  },

  {
    id: 7,
    title: "Islamic Art Exhibition Breaks Attendance Records at Metropolitan Museum",
    content: `The Metropolitan Museum of Art's groundbreaking exhibition "Islamic Civilizations: Art, Science, and Culture" has broken attendance records, with over 500,000 visitors in its first six months. The exhibition, which runs until the end of the year, showcases 1,000 years of Islamic artistic and intellectual achievement.

The exhibition features over 300 objects from the museum's collection and loans from institutions worldwide, including calligraphy, textiles, scientific instruments, architectural elements, and illuminated manuscripts. Interactive displays allow visitors to explore the connections between Islamic art and contemporary creative expressions.

"This exhibition challenges many misconceptions about Islamic culture and highlights its profound contributions to world civilization," said Dr. Sarah Ahmed, the exhibition's chief curator. "Visitors are amazed to learn about the Islamic roots of many scientific and artistic innovations we take for granted today."

The exhibition has been particularly popular among school groups, with special educational programs designed to teach students about Islamic contributions to mathematics, astronomy, medicine, and architecture. Many visitors have expressed surprise at the diversity and sophistication of Islamic artistic traditions.

Community response has been overwhelmingly positive, with Muslim organizations praising the respectful and comprehensive presentation of Islamic culture. The exhibition has also fostered increased dialogue between Muslim and non-Muslim communities in New York.

Plans are underway to create a traveling version of the exhibition that will visit museums across the United States and internationally, extending its educational impact to broader audiences.`,
    summary: "Metropolitan Museum's Islamic art exhibition breaks attendance records with 500,000 visitors, showcasing 1,000 years of Islamic artistic and intellectual contributions.",
    url: "https://artandislam.org/met-exhibition-success",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    category: "Culture",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Art & Islam Today",
    sourceUrl: "https://artandislam.org",
    sourceRegion: "North America",
    sourceLogo: null,
    importance: 7,
    countries: JSON.stringify(["United States"]),
    tags: JSON.stringify(["art", "exhibition", "culture", "museum", "education", "islamic civilization"])
  },

  {
    id: 8,
    title: "Muslim Student Athletes Excel in International University Games",
    content: `Muslim student athletes from around the world have achieved remarkable success at the International University Games, winning medals across multiple sports while maintaining their religious practices and obligations. The games, held in Italy, featured over 8,000 athletes from 165 countries.

Notable achievements include gold medals won by Zeinab Hassan (Egypt) in taekwondo, Ahmed Al-Mansouri (UAE) in swimming, and the Malaysian women's badminton team. These athletes have become role models for young Muslims, demonstrating that excellence in sports is compatible with Islamic values and practices.

The games featured special accommodations for Muslim athletes, including prayer facilities, halal food options, and adjusted training schedules during prayer times. This inclusive approach has been praised by the International University Sports Federation and has set a precedent for future international sporting events.

"Representing my country and my faith on this international stage is an incredible honor," said gold medalist Zeinab Hassan. "I hope to inspire other young Muslim women to pursue their dreams in sports while staying true to their beliefs and values."

The success of Muslim athletes has been celebrated across the Islamic world, with many receiving hero's welcomes upon returning to their home countries. Sports commentators have noted the increasing visibility and success of Muslim athletes in international competitions.

Several athletes have announced plans to use their platforms to promote youth sports programs in their communities and to advocate for greater inclusion and understanding in international sports.`,
    summary: "Muslim student athletes achieve remarkable success at International University Games, winning multiple medals while maintaining religious practices and inspiring youth.",
    url: "https://muslimathletesnews.com/university-games-success",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    category: "Sports",
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    scrapedAt: new Date().toISOString(),
    sourceName: "Muslim Athletes News",
    sourceUrl: "https://muslimathletesnews.com",
    sourceRegion: "Global",
    sourceLogo: null,
    importance: 6,
    countries: JSON.stringify(["Italy", "Egypt", "UAE", "Malaysia"]),
    tags: JSON.stringify(["sports", "athletes", "university games", "muslim youth", "international competition"])
  }
];

module.exports = {
  SEED_ARTICLES
}; 