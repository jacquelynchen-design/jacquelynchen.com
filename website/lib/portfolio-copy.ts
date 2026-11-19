export const resumeUrl = (language: 'en' | 'fr') => `/resume/JacquelynChen-resume-${language}.pdf`;
export const copy = {
 en: {
  contact: 'Contact me', resume: 'Download my resumé', email: 'Email me', about: 'About me', work: 'Selected work', skip: 'Skip to content', navigation: 'Main navigation', mobileNavigation: 'Mobile navigation', openMenu: 'Open navigation', closeMenu: 'Close navigation', light: 'Switch to light appearance', dark: 'Switch to dark appearance', home: 'Jacquelyn Chen, home', contactResume: 'Contact and résumé',
  intro: 'I’m Jacquelyn, a product designer based in Paris. I love tackling complex problems and crafting every step of the user’s journey, so the products I design feel effortless to use.',
  capabilities: [
    [
      "5 years in visual design",
      "I finetuned my design instincts working as a visual designer at advertising agencies like TBWA and BBH. I worked on branding and identity primarily, as well as marketing materials, conceptual designs, and even illustration."
    ],
    [
      "5 years in product design",
      "In 2020, I started to transition into UX and product design, in 2021 I had my first freelance mission. I worked on internal tools, SaaS and MaaS platforms, niche products, as well as consumer-facing websites."
    ],
    [
      "How I work",
      "A pixel-perfect screen is only the beginning of my work. I prepare myself to handle uncertain situations, be ready to analyse, organise, reframe or pivot. Needless to say, I would be working closely with the team to help shape decisions and create solutions."
    ],
    [
      "What I’ve done",
      "I’ve created public-facing work for Singapore Airlines, Assurance Maladie, Scoot, just to name a few. I’ve stepped into the worlds of building inspectors, job seekers and assistance operators. Getting to understand someone’s working day is a highlight of my job."
    ]
],
  quotes: ['My car broke down and I want to go home', 'I need a replacement vehicle', 'I need to travel long distance to see a doctor', 'I want to work at Scoot Airways', 'I need to report on structural damage'],
  mobility: 'Mobility', data: 'Data vis', explore: 'Explore project', soon: 'Coming soon', caseSoon: 'The full case study is coming soon.', viewDesign: 'View portfolio design', mapAlt: 'Transit map illustration from the portfolio design', close: 'Close', title: 'Jacquelyn Chen | Product Designer in Paris',
 },
 fr: {
  contact: 'Me contacter', resume: 'Télécharger mon CV', email: 'Écrivez-moi', about: 'À propos', work: 'Mes projets', skip: 'Aller au contenu', navigation: 'Navigation principale', mobileNavigation: 'Navigation mobile', openMenu: 'Ouvrir le menu', closeMenu: 'Fermer le menu', light: 'Passer au mode clair', dark: 'Passer au mode sombre', home: 'Jacquelyn Chen, accueil', contactResume: 'Contact et CV',
  intro: 'Moi, c’est Jacquelyn, product designer à Paris. J’aime relever des défis complexes et soigner chaque étape du parcours, pour que les produits que je conçois soient tout simplement faciles à utiliser.',
  capabilities: [
    [
      "5 ans en design graphique",
      "J’ai affiné mon regard de designer en tant que graphiste dans des agences de publicité comme TBWA et BBH. J’ai surtout travaillé sur l’identité de marque, mais aussi sur des supports de communication, des concepts créatifs et même de l’illustration."
    ],
    [
      "5 ans en design produit",
      "En 2020, j’ai commencé ma transition vers l’UX et le design produit, et en 2021 j’ai décroché ma première mission en freelance. J’ai travaillé sur des outils internes, des plateformes SaaS et MaaS, des produits de niche ainsi que des sites destinés au grand public."
    ],
    [
      "Ma façon de travailler",
      "Un écran au pixel près n’est que le début de mon travail. Je me prépare à gérer l’incertitude, prête à analyser, organiser, recadrer ou changer de cap. Bien entendu, je travaille en étroite collaboration avec l’équipe pour orienter les décisions et construire des solutions."
    ],
    [
      "Ce que j’ai conçu",
      "J’ai créé des projets destinés au public pour Singapore Airlines, l’Assurance Maladie et Scoot, pour n’en citer que quelques-uns. Je me suis glissée dans le quotidien d’inspecteurs de bâtiments, de candidats à l’embauche et de chargés d’assistance. Comprendre la journée de travail de quelqu’un est l’un des points forts de mon métier."
    ]
],
  quotes: ['Ma voiture est en panne et je veux rentrer chez moi', 'Il me faut un véhicule de remplacement', 'Je dois consulter un médecin loin de chez moi', 'J’aimerais travailler chez Scoot Airways', 'Je dois signaler des dommages sur une structure'],
  mobility: 'Mobilité', data: 'Dataviz', explore: 'Découvrir le projet', soon: 'À venir', caseSoon: 'L’étude de cas complète arrive bientôt.', viewDesign: 'Voir la maquette du portfolio', mapAlt: 'Illustration d’un plan de transport issue de la maquette du portfolio', close: 'Fermer', title: 'Jacquelyn Chen | Product designer à Paris',
 },
} as const;
