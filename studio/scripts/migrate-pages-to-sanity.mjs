/**
 * One-off migration (October 2026): moves copy that used to be hardcoded in the
 * Astro app into Sanity, and gives each page its own document.
 *
 * Step "add" only creates documents and adds fields, so the previous site code
 * keeps working. It creates documents only when missing and never overwrites
 * existing values, so re-running it doesn't undo editors' changes. Step "cleanup" runs after the new site code is deployed: it
 * converts old field shapes, removes replaced fields and deletes retired documents.
 *
 * Usage (from studio/):
 *   npx sanity exec scripts/migrate-pages-to-sanity.mjs --with-user-token -- add
 *   npx sanity exec scripts/migrate-pages-to-sanity.mjs --with-user-token -- cleanup
 */
import {randomBytes} from 'node:crypto'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-12-08'})
const step = process.argv.at(-1)

const key = () => randomBytes(6).toString('hex')
const str = (en, fr) => ({_type: 'localeString', en, fr})
const text = (en, fr) => ({_type: 'localeText', en, fr})
const url = (en, fr) => ({_type: 'localeUrl', en, ...(fr ? {fr} : {})})

// Portable text helpers. A span is a string or [text, {strong?, href?}].
function block(style, spans, listItem) {
  const markDefs = []
  const children = spans.map((s) => {
    const [t, opts = {}] = typeof s === 'string' ? [s] : s
    const marks = []
    if (opts.strong) marks.push('strong')
    if (opts.href) {
      const k = key()
      markDefs.push({_key: k, _type: 'link', href: opts.href})
      marks.push(k)
    }
    return {_key: key(), _type: 'span', text: t, marks}
  })
  const b = {_key: key(), _type: 'block', style, markDefs, children}
  if (listItem) Object.assign(b, {listItem, level: 1})
  return b
}
const p = (...spans) => block('normal', spans)
const h2 = (t) => block('h2', [t])
const li = (...spans) => block('normal', spans, 'bullet')
const rich = (en, fr) => ({_type: 'localePortableText', en, fr})

const cta = (heading, body, buttonLabel, buttonLink) => ({
  _type: 'callToAction',
  heading,
  body,
  ...(buttonLabel ? {buttonLabel} : {}),
  ...(buttonLink ? {buttonLink} : {}),
})

const DISCORD = 'https://discord.gg/qK2cnSWmvF'
const image = (img) => (img?.asset ? {_type: 'image', asset: img.asset, ...(img.hotspot ? {hotspot: img.hotspot} : {}), ...(img.crop ? {crop: img.crop} : {})} : undefined)

function page(id, {title, subtitle, heroImage, sections = []}) {
  return {
    _id: id,
    _type: 'page',
    title,
    ...(subtitle ? {subtitle} : {}),
    ...(heroImage ? {heroImage} : {}),
    sections: sections.map((section) => ({_key: key(), ...section})),
  }
}

async function add() {
  const settings = await client.fetch(`*[_type == "pageSettings"][0]`)
  if (!settings) throw new Error('pageSettings not found; was "add" already run and cleaned up?')
  const [teamsPage, nationalTeamPage, eventBidsPage, whatIsQuadball] = await Promise.all([
    client.fetch(`*[_type == "teamsPage" && _id != "teamsPage"][0]`),
    client.fetch(`*[_type == "nationalTeamPage" && _id != "nationalTeamPage"][0]`),
    client.fetch(`*[_type == "eventBidsPage" && _id != "eventBidsPage"][0]`),
    client.fetch(`*[_type == "infoArticle" && slug.en.current == "what-is-quadball"][0]{_id}`),
  ])

  const tx = client.transaction()

  // Site-wide settings: menu, footer, social links
  const navItem = (en, fr, hrefEn, hrefFr, children) => ({
    _key: key(),
    _type: children ? 'menuItem' : 'menuSubItem',
    label: str(en, fr),
    link: url(hrefEn, hrefFr),
    ...(children ? {children} : {}),
  })
  const sub = (...args) => navItem(...args)
  const top = (en, fr, hrefEn, hrefFr, children = []) => ({...navItem(en, fr, hrefEn, hrefFr, children), _type: 'menuItem'})
  const footerLink = (en, fr, hrefEn, hrefFr) => ({_key: key(), _type: 'footerLink', label: str(en, fr), link: url(hrefEn, hrefFr)})

  tx.createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    navigation: [
      top('Announcements', 'Communiqués', '/news/', '/fr/nouvelles/'),
      top('About Us', 'À propos', '/about/', '/fr/a-propos/', [
        sub('Mission & Values', 'Mission et valeurs', '/about/mission-and-values/', '/fr/a-propos/mission-et-valeurs/'),
        sub('What is Quadball?', "Qu'est-ce que le quadball?", '/info/what-is-quadball/', '/fr/info/quest-ce-que-le-quadball/'),
        sub('Meet the Board', "Conseil d'administration", '/about/meet-the-board/', '/fr/a-propos/conseil/'),
        sub('Meet the Staff', 'Équipe', '/about/meet-the-staff/', '/fr/a-propos/equipe/'),
        sub('Inclusion & Gender Equity', 'Inclusion et équité des genres', '/info/inclusion/', '/fr/info/inclusion/'),
        sub('National Team Program', "Programme de l'équipe nationale", '/teams/national-team/', '/fr/equipes/equipe-nationale/'),
      ]),
      top('Resources', 'Ressources', '/resources/', '/fr/ressources/', [
        sub('Policies', 'Politiques', '/resources/policies/', '/fr/ressources/politiques/'),
        sub('Starting a Team', 'Démarrer une équipe', '/resources/starting-a-team/', '/fr/ressources/demarrer-une-equipe/'),
        sub('Drill Bank', "Banque d'exercices", 'https://www.qdrill.app', 'https://www.qdrill.app'),
        sub('Planning a Tournament', 'Planifier un tournoi', '/resources/planning-a-tournament/', '/fr/ressources/planifier-un-tournoi/'),
      ]),
      top('Events', 'Événements', '/events/', '/fr/evenements/', [
        sub('Upcoming Events', 'Événements à venir', '/events/upcoming/', '/fr/evenements/a-venir/'),
        sub('Event Bids', "Appels d'offres", '/events/bids/', '/fr/evenements/appels-doffres/'),
      ]),
      top('Get Involved', "S'impliquer", '/get-involved/', '/fr/simpliquer/', [
        sub('Find a Team', 'Trouver une équipe', '/teams/', '/fr/equipes/'),
        sub('Volunteer Opportunities', 'Bénévolat', '/volunteer-opportunities/', '/fr/benevolat/'),
        sub('Host an Event', 'Organiser un événement', '/get-involved/host-an-event/', '/fr/simpliquer/organiser-un-evenement/'),
      ]),
    ],
    storeUrl: 'https://vcultimate.com/collections/quadball-canada?shpxid=72ea749d-601f-49be-94f8-23c6469b0790',
    donateUrl: 'https://www.paypal.me/quidditchcanada',
    footerColumns: [
      {
        _key: key(),
        _type: 'footerColumn',
        title: str('Get Involved', "S'impliquer"),
        links: [
          footerLink('Find a Team', 'Trouver une équipe', '/teams/', '/fr/equipes/'),
          footerLink('Host an Event', 'Organiser un événement', '/get-involved/host-an-event/', '/fr/simpliquer/organiser-un-evenement/'),
          footerLink('Team Canada', 'Équipe Canada', '/teams/national-team/', '/fr/equipes/equipe-nationale/'),
          footerLink('Volunteer', 'Bénévolat', '/volunteer-opportunities/', '/fr/benevolat/'),
        ],
      },
      {
        _key: key(),
        _type: 'footerColumn',
        title: str('Explore', 'Explorer'),
        links: [
          footerLink('About', 'À propos', '/about/', '/fr/a-propos/'),
          footerLink('Latest News', 'Nouvelles', '/news/', '/fr/nouvelles/'),
          footerLink('Events', 'Événements', '/events/', '/fr/evenements/'),
          footerLink('Rules', 'Règles', 'https://docs.google.com/document/d/1xyBZHdchrsNmDNDhMFml34Iz2XFp0CAYA8-oVG9lY9Q/'),
        ],
      },
    ],
    charityNumber: '820553188RR0001',
    socialLinks: [
      ['instagram', 'https://www.instagram.com/quadballcanada/'],
      ['tiktok', 'https://www.tiktok.com/@quadballcanada'],
      ['youtube', 'https://www.youtube.com/@QuadballCanada'],
      ['facebook', 'https://www.facebook.com/QuadballCanada/'],
      ['discord', DISCORD],
    ].map(([platform, href]) => ({_key: key(), _type: 'socialLink', platform, url: href})),
    siteDescription: text(
      'Quadball Canada — official site. Building community through sport across Canada.',
      'Quadball Canada — site officiel. Construire une communauté sportive partout au Canada.',
    ),
    ...(image(settings.defaultHeroImage) ? {defaultHeroImage: image(settings.defaultHeroImage)} : {}),
  })

  tx.createIfNotExists({
    _id: 'homePage',
    _type: 'homePage',
    hero: {
      title: str('Quadball Canada', 'Quadball Canada'),
      subtitle: text('Building community through sport across Canada.', 'Une communauté sportive inclusive partout au Canada.'),
      buttonLabel: str('Get Involved', "S'impliquer"),
      buttonLink: url('/get-involved/', '/fr/simpliquer/'),
    },
    ...(whatIsQuadball ? {featuredArticle: {_type: 'reference', _ref: whatIsQuadball._id}} : {}),
    support: {
      heading: str('Support Quadball Canada', 'Soutenir Quadball Canada'),
      body: text(
        'Your donation helps grow quadball nationwide and supports inclusive programs.',
        'Vos contributions aident à développer le quadball et à soutenir des programmes inclusifs.',
      ),
      donateLabel: str('Donate', 'Faire un don'),
      sponsorshipLabel: str('Sponsorship', 'Commandites'),
      sponsorshipEmail: 'sponsorship@quadballcanada.ca',
    },
  })

  const values = [
    ['Fair and Respectful Play', 'Jeu équitable et respectueux', 'We play with integrity and respect, no matter the outcome', 'Nous jouons avec intégrité et respect, peu importe le résultat'],
    ['Inclusive Community', 'Communauté inclusive', 'Creating connection through a shared love of sport and ensuring our community is safe, accessible, and inclusive to all', "Créer des liens grâce à un amour partagé du sport et s'assurer que notre communauté est sécuritaire, accessible et inclusive pour tous"],
    ['Shared Leadership', 'Leadership partagé', 'Working in collaboration with our members to achieve our goals collectively and make space for everyone to contribute', 'Travailler en collaboration avec nos membres pour atteindre nos objectifs collectivement et faire de la place pour que chacun puisse contribuer'],
    ['Safety', 'Sécurité', 'The physical, cultural, and emotional welfare of our members and volunteers is paramount in every quadball event', 'Le bien-être physique, culturel et émotionnel de nos membres et bénévoles est primordial dans chaque événement de quadball'],
    ['Anti-Oppression', 'Anti-oppression', 'Actively working to combat oppression and racism in our sport and the broader community', "Travailler activement à combattre l'oppression et le racisme dans notre sport et la communauté au sens large"],
    ['Fun', 'Plaisir', 'Infusing the joyful and adventurous spirit that draws people to play quadball into everything we do', "Insuffler l'esprit joyeux et aventureux qui attire les gens à jouer au quadball dans tout ce que nous faisons"],
  ]
  tx.createIfNotExists({
    _id: 'missionValuesPage',
    _type: 'missionValuesPage',
    title: str('Mission & Values', 'Mission et valeurs'),
    mission: text(
      'To lead, grow, and promote the sport of quadball in Canada.',
      'Diriger, développer et promouvoir le sport du quadball au Canada.',
    ),
    values: values.map(([tEn, tFr, dEn, dFr]) => ({_key: key(), _type: 'value', title: str(tEn, tFr), description: text(dEn, dFr)})),
    seo: {
      metaDescription: text(
        "Learn about Quadball Canada's mission to lead, grow, and promote the sport of quadball in Canada, and the values that guide everything we do.",
        'Découvrez la mission de Quadball Canada de diriger, développer et promouvoir le sport du quadball au Canada, ainsi que les valeurs qui guident tout ce que nous faisons.',
      ),
    },
  })

  const card = (icon, tEn, tFr, dEn, dFr, email) => ({_key: key(), _type: 'contactCard', icon, title: str(tEn, tFr), description: text(dEn, dFr), email})
  tx.createIfNotExists({
    _id: 'contactPage',
    _type: 'contactPage',
    title: str('Contact Us', 'Nous joindre'),
    subtitle: text('Get in touch with Quadball Canada', 'Communiquez avec Quadball Canada'),
    cards: [
      card('mail', 'General Inquiries', 'Demandes générales', 'Questions about quadball, membership, or getting started?', "Questions sur le quadball, l'adhésion ou comment commencer?", 'info@quadballcanada.ca'),
      card('newspaper', 'Media & Press', 'Médias et presse', 'Interview requests, press releases, and media coverage', "Demandes d'entrevue, communiqués de presse et couverture médiatique", 'media@quadballcanada.ca'),
      card('trophy', 'Events & Competition', 'Événements et compétition', 'Tournament inquiries and event coordination', "Demandes de tournois et coordination d'événements", 'events@quadballcanada.ca'),
    ],
    socialHeading: str('Connect With Us', 'Suivez-nous'),
    socialBody: text('Follow us on social media for the latest updates', 'Suivez-nous sur les réseaux sociaux pour les dernières nouvelles'),
  })

  // Standalone pages
  tx.createIfNotExists(page('page-board', {
    title: str('Meet the Board', "Conseil d'administration"),
    subtitle: text(
      "Quadball Canada's volunteer board of directors provides strategic leadership and governance for the organization.",
      "Le conseil d'administration bénévole de Quadball Canada assure la direction stratégique et la gouvernance de l'organisation.",
    ),
    heroImage: image(settings.boardHeroImage),
  }))
  tx.createIfNotExists(page('page-staff', {
    title: str('Meet the Staff', "Rencontrez l'équipe"),
    subtitle: text(
      "Quadball Canada's volunteer leadership team drives member services, events, and programs nationwide.",
      "Les bénévoles de Quadball Canada soutiennent les services aux membres, les événements et les programmes d'un océan à l'autre.",
    ),
    heroImage: image(settings.staffHeroImage),
  }))
  tx.createIfNotExists(page('page-policies', {
    title: str('Policies', 'Politiques'),
    subtitle: text(
      'Official policies and documents governing Quadball Canada operations, events, and gameplay.',
      'Politiques et documents officiels régissant les opérations, les événements et le jeu de Quadball Canada.',
    ),
    heroImage: image(settings.policiesHeroImage),
  }))
  tx.createIfNotExists(page('page-news', {
    title: str('News & Announcements', 'Nouvelles et communiqués'),
    subtitle: text('Stay up to date with the latest from Quadball Canada', 'Restez à jour avec les dernières nouvelles de Quadball Canada'),
    heroImage: image(settings.newsHeroImage),
  }))
  tx.createIfNotExists(page('page-upcomingEvents', {
    title: str('Upcoming Events', 'Événements à venir'),
    subtitle: text(
      'Find upcoming quadball tournaments, camps, and events across Canada.',
      'Découvrez les tournois, camps et événements de quadball à venir partout au Canada.',
    ),
  }))
  tx.createIfNotExists(page('page-volunteer', {
    title: str('Volunteer Opportunities', 'Occasions de bénévolat'),
    subtitle: text(
      'Quadball Canada relies on volunteers to power events, local programs, and national initiatives. Use the filters to find a role that matches your interests and availability.',
      'Quadball Canada offre des occasions de bénévolat pour soutenir des événements, des programmes locaux et des initiatives nationales. Utilisez les filtres pour trouver un rôle qui correspond à vos intérêts et à votre disponibilité.',
    ),
    heroImage: image(settings.volunteerHeroImage),
    sections: [
      {
        _type: 'ctaSection',
        style: 'light',
        cta: cta(
          str('Join our Discord community', 'Rejoignez notre communauté Discord'),
          text(
            'Connect with volunteers, ask questions, and stay updated on new opportunities.',
            'Connectez-vous avec des bénévoles, posez des questions et restez informé des nouvelles opportunités.',
          ),
          str('Join Discord', 'Rejoindre le Discord'),
          url(DISCORD),
        ),
      },
    ],
  }))
  tx.createIfNotExists(page('page-hostEvent', {
    title: str('Host a Quadball Event', 'Organiser un événement de quadball'),
    heroImage: image(settings.hostEventHeroImage),
    sections: [
      {
        _type: 'textSection',
        style: 'plain',
        body: rich(
          [p('Bring quadball to your community with support from Quadball Canada. We help organizers deliver high quality tournaments, clinics, camps, and exhibition games that are safe, inclusive, and fun.')],
          [p("Faites découvrir le quadball à votre communauté avec l'appui de Quadball Canada. Nous aidons les organisateur.rice.s à proposer des tournois, des cliniques et des vitrines inclusives et bien planifiées.")],
        ),
      },
      {
        _type: 'columnsSection',
        columns: [
          {
            _key: key(),
            _type: 'column',
            heading: str('Plan your event', 'Planifier votre événement'),
            body: rich(
              [
                li(['Select a format', {strong: true}], ' — single day mixer, multi day tournament, youth clinic, or exhibition showcase.'),
                li(['Choose a venue', {strong: true}], ' — level grass or turf field (60m x 40m minimum) with access to washrooms and parking.'),
                li(['Set a timeline', {strong: true}], ' — allow 8 to 12 weeks for promotion, registration, and volunteer recruitment.'),
                li(['Build a team', {strong: true}], ' — identify a tournament director, head official, medical lead, and volunteer captain.'),
              ],
              [
                li(['Choisir un format', {strong: true}], " — tournoi d'une journée, fin de semaine, clinique jeunesse ou match amical."),
                li(['Trouver un site', {strong: true}], ' — terrain plat (60 m x 40 m minimum) avec accès à des toilettes et du stationnement.'),
                li(['Établir un calendrier', {strong: true}], ' — prévoir 8 à 12 semaines pour la promotion, les inscriptions et le recrutement de bénévoles.'),
                li(['Former une équipe', {strong: true}], ' — directeur ou directrice de tournoi, responsable des officiels, responsable médical et chef des bénévoles.'),
              ],
            ),
          },
          {
            _key: key(),
            _type: 'column',
            heading: str('What we provide', 'Ce que nous offrons'),
            body: rich(
              [
                li('Event sanctioning, insurance guidance, and risk management templates.'),
                li('Scheduling support and score keeping tools tailored for quadball.'),
                li('Connections to certified referees, volunteers, and regional teams.'),
                li('Marketing amplification through Quadball Canada channels.'),
              ],
              [
                li("Homologation de l'événement, conseils sur l'assurance et gabarits de gestion des risques."),
                li("Soutien à l'horaire et outils de tenue de scores adaptés au quadball."),
                li('Liens avec des arbitres certifiés, des bénévoles et des équipes régionales.'),
                li('Promotion sur les plateformes de Quadball Canada.'),
              ],
            ),
          },
        ],
      },
      {
        _type: 'textSection',
        style: 'panel',
        heading: str('Facilities and equipment checklist', 'Installation et équipement'),
        body: rich(
          [
            li('Regulation hoops, balls, boundary marker set, and scoreboard.'),
            li('On site medical space with first aid kit and emergency action plan.'),
            li('Weather contingency plan (indoor backup or reschedule policy).'),
            li('Accessibility considerations for athletes, officials, and spectators.'),
          ],
          [
            li('Anneaux réglementaires, ballons, marqueurs de limites et tableau indicateur.'),
            li("Espace médical sur place avec trousse de premiers soins et plan d'intervention."),
            li('Plan de contingence météo (option intérieur ou stratégie de report).'),
            li("Mesures d'accessibilité pour les athlète.s, officiels et spectateur.rice.s."),
          ],
        ),
      },
      {
        _type: 'ctaSection',
        style: 'primary',
        cta: cta(
          str('Ready to get started?', 'Prêt.e à commencer?'),
          text(
            'Share your concept with us and we will follow up with next steps, sanctioning requirements, and a tailored resource kit.',
            "Transmettez-nous votre idée et nous vous enverrons les prochaines étapes, les exigences d'homologation et une trousse de ressources personnalisée.",
          ),
          str('Request Hosting Support', "Demander de l'aide pour l'organisation"),
          url('/contact/', '/fr/contact/'),
        ),
      },
      {
        _type: 'ctaSection',
        style: 'light',
        cta: cta(
          str('Want to host a Regional or National Championship?', 'Vous souhaitez accueillir un Championnat régional ou national?'),
          text(
            'Championship events are awarded through a formal bidding process. Learn about evaluation criteria, timelines, and how to submit your bid.',
            "Les championnats sont attribués par un processus d'appel d'offres formel. Découvrez les critères d'évaluation, les échéanciers et comment soumettre votre candidature.",
          ),
          str('Event Bids', "Appels d'offres"),
          url('/events/bids/', '/fr/evenements/appels-doffres/'),
        ),
      },
    ],
  }))

  // Banner images move from Page Settings onto each page's own document
  const landingImages = {
    'landingSection-about': settings.aboutHeroImage,
    'landingSection-events': settings.eventsHeroImage,
    'landingSection-getInvolved': settings.getInvolvedHeroImage,
    'landingSection-resources': settings.resourcesHeroImage,
  }
  for (const [id, img] of Object.entries(landingImages)) {
    if (image(img)) tx.patch(id, (patch) => patch.setIfMissing({heroImage: image(img)}))
  }

  // Teams page under a fixed ID, with two-language links and the Discord box
  if (teamsPage) {
    const {_id, _rev, _createdAt, _updatedAt, ...rest} = teamsPage
    tx.createIfNotExists({
      ...rest,
      _id: 'teamsPage',
      ...(image(settings.teamsHeroImage) ? {heroImage: image(settings.teamsHeroImage)} : {}),
      cta: {...rest.cta, _type: 'callToAction', buttonLink: url('/contact/', '/fr/contact/')},
      levels: rest.levels.map((level) =>
        level.cta?.href === '/teams/national-team/'
          ? {...level, cta: {...level.cta, link: url('/teams/national-team/', '/fr/equipes/equipe-nationale/')}}
          : level,
      ),
      levelsHeading: str('Levels of Play', 'Niveaux de jeu'),
      levelsIntro: text(
        'Explore the different levels of play available across Canada.',
        'Explorez les différents niveaux de jeu disponibles au Canada.',
      ),
      communityCta: cta(
        str('Join our Discord community', 'Rejoignez notre communauté Discord'),
        text(
          'Connect with players, ask questions, and stay updated on events and opportunities.',
          'Connectez-vous avec des joueurs, posez des questions et restez informé des événements et opportunités.',
        ),
        str('Join Discord', 'Rejoindre le Discord'),
        url(DISCORD),
      ),
    })
  }

  if (nationalTeamPage) {
    const {_id, _rev, _createdAt, _updatedAt, ...rest} = nationalTeamPage
    tx.createIfNotExists({
      ...rest,
      _id: 'nationalTeamPage',
      cta: {...rest.cta, link: url(rest.cta?.href ?? 'mailto:teamcanada@quadballcanada.ca')},
      supportCta: cta(
        str('Support Team Canada', 'Soutenez Équipe Canada'),
        text(
          'Help our athletes represent Canada at international competitions. Your donation directly supports training, travel, and equipment for Team Canada players.',
          "Aidez nos athlètes à représenter le Canada aux compétitions internationales. Votre don soutient directement l'entraînement, les déplacements et l'équipement des joueurs d'Équipe Canada.",
        ),
        str('Donate on MakeAChamp', 'Faire un don sur MakeAChamp'),
        url('https://makeachamp.com/qcteamcanada'),
      ),
    })
  }

  if (eventBidsPage) {
    const {_id, _rev, _createdAt, _updatedAt, ...rest} = eventBidsPage
    tx.createIfNotExists({
      ...rest,
      _id: 'eventBidsPage',
      title: str('Event Bids', "Appels d'offres"),
      subtitle: text(
        'Learn how to bid to host a Quadball Canada Regional or National Championship.',
        'Découvrez comment soumettre une candidature pour accueillir un Championnat régional ou national de Quadball Canada.',
      ),
      ...(image(settings.eventsHeroImage) ? {heroImage: image(settings.eventsHeroImage)} : {}),
      intro: {
        heading: str('How Championships Find a Home', "Comment les championnats trouvent un lieu d'accueil"),
        body: text(
          "Quadball Canada awards Regional and National Championships to host communities through a formal bidding process. This ensures that all interested communities have an equal and fair opportunity to apply. Many factors are considered throughout this process to align with the organization's overall goals, resource availability and commitments to our membership. Our standards ensure that events are held at quality venues with strong organizational support, growing the sport across the country.",
          "Quadball Canada attribue les Championnats régionaux et nationaux aux communautés hôtes par un processus d'appel d'offres formel. Cela garantit que toutes les communautés intéressées ont une chance égale et équitable de postuler. De nombreux facteurs sont pris en compte tout au long de ce processus pour s'aligner sur les objectifs généraux de l'organisation, la disponibilité des ressources et les engagements envers nos membres. Nos normes garantissent que les événements se déroulent dans des installations de qualité avec un solide soutien organisationnel, favorisant la croissance du sport à travers le pays.",
        ),
      },
      application: {
        label: str('Application Process', 'Processus de candidature'),
        howToBidHeading: str('How to Bid?', 'Comment soumettre une candidature?'),
        howToBidBody: text(
          'Quadball Canada opens its bidding cycle and provides information in our bid manual about the requirements we have for hosts. For each respective event, we have certain expectations and standards that need to be met in the following areas: facility, technical, medical, accommodations, marketing, promotions and funding. Additionally, our bids include an enhanced event requirement category, where we ask hosts to highlight further value adds that could benefit and elevate the event experience. This includes but is not limited to indoor facilities, food and beverage, legacy pieces and complimentary offerings.',
          "Quadball Canada ouvre son cycle d'appel d'offres et fournit dans notre manuel d'appel d'offres les informations sur les exigences que nous avons pour les hôtes. Pour chaque événement, nous avons certaines attentes et normes qui doivent être respectées dans les domaines suivants : installations, aspects techniques, services médicaux, hébergement, marketing, promotions et financement. De plus, nos appels d'offres incluent une catégorie d'exigences événementielles améliorées, où nous demandons aux hôtes de mettre en valeur des éléments supplémentaires qui pourraient bénéficier et rehausser l'expérience de l'événement. Cela inclut, sans s'y limiter, les installations intérieures, la restauration, les éléments patrimoniaux et les offres complémentaires.",
        ),
        whoCanBidHeading: str('Who can Bid?', 'Qui peut soumettre une candidature?'),
        whoCanBid: [
          str('Canadian Quadball Clubs & Teams', 'Clubs et équipes canadiens de quadball'),
          str('Individual Canadian Quadball Members', 'Membres individuels de Quadball Canada'),
          str('Canadian Municipalities', 'Municipalités canadiennes'),
          str('Canadian Tourism Organizations', 'Organismes touristiques canadiens'),
        ].map((item) => ({...item, _key: key()})),
      },
      steps: {
        heading: str('How to Submit a Bid', 'Comment soumettre une candidature'),
        items: [
          text('Review the Bid Manual for full requirements and evaluation criteria.', "Consultez le Manuel d'appel d'offres pour les exigences complètes et les critères d'évaluation."),
          text('Prepare your bid package including venue details, budget, accommodation plan, and local organizing committee.', "Préparez votre dossier de candidature incluant les détails du site, le budget, le plan d'hébergement et le comité organisateur local."),
          text('Submit your completed bid through the online form before the posted deadline.', 'Soumettez votre candidature complétée via le formulaire en ligne avant la date limite affichée.'),
          text('Bids are reviewed by the Events Committee, and hosts are announced within 4-6 weeks of the deadline.', 'Les candidatures sont évaluées par le Comité des événements et les hôtes sont annoncés dans les 4 à 6 semaines suivant la date limite.'),
        ].map((item) => ({...item, _key: key()})),
      },
      selection: {
        label: str('Selection Process', 'Processus de sélection'),
        heading: str('How does your bid win?', 'Comment votre candidature peut-elle être retenue?'),
        body: text(
          [
            'Once Quadball Canada receives all potential bid applications, we carefully review each submission to assess whether or not each host is able to meet our outlined requirements.',
            'Any host that cannot meet the majority of our requirements is no longer considered for the event. Should all hosts meet our outlined requirements, we then assess and compare the Enhanced Event Elements they have offered in their application.',
            'If the Enhanced Event Elements are comparable amongst the applications, we then consider the geographical locations we have recently hosted in over the last two years, as well as the grant funding we can access, based on municipal and provincial availability in each region.',
            "Our final considerations, prior to host selection, is to account for Quadball Canada's mission, vision and values. We always want to ensure that our hosts align with who we are and what we do, which is to lead, grow and promote our sport in Canada.",
            'Once all of the above areas have been assessed, we are then able to select our hosts.',
          ].join('\n\n'),
          [
            'Lorsque Quadball Canada reçoit toutes les candidatures potentielles, nous examinons attentivement chaque soumission pour évaluer si chaque hôte est en mesure de répondre à nos exigences.',
            "Tout hôte qui ne peut pas répondre à la majorité de nos exigences n'est plus considéré pour l'événement. Si tous les hôtes répondent à nos exigences, nous évaluons et comparons alors les éléments événementiels améliorés qu'ils ont offerts dans leur candidature.",
            'Si les éléments événementiels améliorés sont comparables entre les candidatures, nous considérons alors les emplacements géographiques où nous avons récemment organisé des événements au cours des deux dernières années, ainsi que le financement par subventions auquel nous pouvons accéder, selon la disponibilité municipale et provinciale dans chaque région.',
            "Nos dernières considérations, avant la sélection de l'hôte, consistent à tenir compte de la mission, de la vision et des valeurs de Quadball Canada. Nous voulons toujours nous assurer que nos hôtes s'alignent sur qui nous sommes et ce que nous faisons, c'est-à-dire diriger, développer et promouvoir notre sport au Canada.",
            'Une fois que tous les domaines ci-dessus ont été évalués, nous sommes alors en mesure de sélectionner nos hôtes.',
          ].join('\n\n'),
        ),
      },
      getInvolved: {
        label: str('Get Involved', "S'impliquer"),
        heading: str('How do I bring an event to my community?', 'Comment organiser un événement dans ma communauté?'),
        body: text(
          'If you, your team or your community is interested in hosting a Quadball Canada event, you should reach out to your local City Tourism group. These organizations know the ins and outs of bid applications and will help support you in completing our bid application package, provide you with insight, logistical support, and grant funding opportunities.',
          'Si vous, votre équipe ou votre communauté êtes intéressés à accueillir un événement de Quadball Canada, vous devriez contacter votre organisme touristique municipal local. Ces organisations connaissent les tenants et aboutissants des candidatures et vous aideront à compléter votre dossier de candidature, vous fourniront des conseils, un soutien logistique et des opportunités de financement par subventions.',
        ),
        contactPrompt: str(
          'For more information on our bidding process please contact:',
          "Pour plus d'informations sur notre processus d'appel d'offres, veuillez contacter :",
        ),
        contactEmails: ['hailey@quadballcanada.ca', 'soleil@quadballcanada.ca'],
      },
      crossLink: cta(
        str('Looking to host a grassroots event?', 'Vous souhaitez organiser un événement communautaire?'),
        text(
          "Community tournaments, clinics, and exhibition games don't require a formal bid. Check out our hosting guide.",
          "Les tournois communautaires, cliniques et matchs amicaux ne nécessitent pas d'appel d'offres formel. Consultez notre guide d'organisation.",
        ),
        str('Host an Event', 'Organiser un événement'),
        url('/get-involved/host-an-event/', '/fr/simpliquer/organiser-un-evenement/'),
      ),
    })
  }

  // Starting a Team becomes a resource article, like Planning a Tournament
  tx.createIfNotExists({
    _id: 'resource-starting-a-team',
    _type: 'resourceArticle',
    title: str('Starting a Team', 'Démarrer une équipe'),
    slug: {
      _type: 'localeSlug',
      en: {_type: 'slug', current: 'starting-a-team'},
      fr: {_type: 'slug', current: 'demarrer-une-equipe'},
    },
    category: 'guide',
    excerpt: text(
      'Ready to bring quadball to your community? This guide will help you get started.',
      'Prêt à apporter le quadball dans votre communauté ? Ce guide vous aidera à démarrer.',
    ),
    ...(image(settings.startingTeamHeroImage)
      ? {heroImage: {...image(settings.startingTeamHeroImage), alt: str('Quadball players on the pitch', 'Joueurs de quadball sur le terrain')}}
      : {}),
    content: rich(
      [
        p(['Coming Soon:', {strong: true}], " We're preparing comprehensive resources to help you start your own quadball team. In the meantime, please ", ['contact us', {href: '/contact/'}], ' for personalized guidance and support.'),
        h2('Quick Tips to Get Started'),
        li('Find 7-10 interested players to form your initial roster'),
        li('Secure a practice space (parks, schools, or community centers work great)'),
        li('Connect with nearby teams for scrimmages and mentorship'),
        li('Register with Quadball Canada for official recognition and support'),
        p('For immediate assistance, reach out to our team at ', ['our contact page', {href: '/contact/'}], '.'),
      ],
      [
        p(['Bientôt disponible :', {strong: true}], ' Nous préparons des ressources complètes pour vous aider à démarrer votre propre équipe de quadball. En attendant, veuillez ', ['nous contacter', {href: '/fr/contact/'}], ' pour des conseils personnalisés et du soutien.'),
        h2('Conseils rapides pour commencer'),
        li('Trouvez 7 à 10 joueurs intéressés pour former votre effectif initial'),
        li('Sécurisez un espace de pratique (parcs, écoles ou centres communautaires)'),
        li('Connectez-vous avec des équipes proches pour des matchs amicaux et du mentorat'),
        li('Inscrivez-vous auprès de Quadball Canada pour une reconnaissance officielle et du soutien'),
        p('Pour une assistance immédiate, contactez notre équipe sur ', ['notre page de contact', {href: '/fr/contact/'}], '.'),
      ],
    ),
    featured: false,
  })

  // The closing box that every info article used to show from code
  const infoIds = await client.fetch(`*[_type == "infoArticle" && !defined(cta)]._id`)
  for (const id of infoIds) {
    tx.patch(id, (patch) =>
      patch.set({
        cta: cta(
          undefined,
          text(
            'If this sounds like the sport for you, reach out to find out how to join a team near you.',
            'Si ce sport vous intéresse, contactez-nous pour savoir comment rejoindre une équipe près de chez vous.',
          ),
          str('Contact Us', 'Nous contacter'),
          url('/contact/', '/fr/contact/'),
        ),
      }),
    )
  }

  // Volunteer summaries saved as plain text never rendered; the schema expects rich text
  const plainSummaries = await client.fetch(`*[_type == "volunteerOpportunity" && (summary.en match "*" || summary.fr match "*") && !defined(summary.en[0]._type)]{_id, summary}`)
  for (const {_id, summary} of plainSummaries) {
    const toBlocks = (value) => (typeof value === 'string' ? value.split(/\n\s*\n/).filter(Boolean).map((para) => p(para.trim())) : value)
    tx.patch(_id, (patch) => patch.set({summary: rich(toBlocks(summary.en), toBlocks(summary.fr))}))
  }

  // Every event is a tournament so far; the one without a type fails validation
  const untypedEvents = await client.fetch(`*[_type == "event" && !defined(eventType)]._id`)
  for (const id of untypedEvents) tx.patch(id, (patch) => patch.set({eventType: 'tournament'}))

  // Teams still carrying the retired contactLevel field get the equivalent levelOfPlay
  const levelFromContact = {'full-contact': 'competitive', recreational: 'recreational'}
  const legacyTeams = await client.fetch(`*[_type == "team" && defined(contactLevel)]{_id, levelOfPlay, contactLevel}`)
  for (const team of legacyTeams) {
    tx.patch(team._id, (patch) => {
      const next = team.levelOfPlay ? patch : patch.set({levelOfPlay: levelFromContact[team.contactLevel] ?? team.contactLevel})
      return next.unset(['contactLevel'])
    })
  }

  const result = await tx.commit()
  console.log(`add: ${result.results.length} mutations committed`)
}

async function cleanup() {
  const tx = client.transaction()

  // Retired documents: duplicates replaced by fixed IDs, unused types, superseded copy
  const retired = await client.fetch(`*[
    (_type in ["teamsPage", "nationalTeamPage", "eventBidsPage"] && !(_id in ["teamsPage", "nationalTeamPage", "eventBidsPage"]))
    || _type in ["pageSettings", "aboutPage", "post"]
    || _id in ["L1A81ErZVmcEweqVJ2B0uX", "325f4bcc-b3cf-4985-9d70-c082ef9033f9"]
  ]{_id, _type}`)
  for (const {_id, _type} of retired) {
    console.log(`delete ${_type} ${_id}`)
    tx.delete(_id)
  }

  // Single-language links replaced by two-language ones
  tx.patch('teamsPage', (patch) => patch.unset(['cta.buttonHref']))
  tx.patch('nationalTeamPage', (patch) => patch.unset(['cta.href']))
  const teamsPage = await client.fetch(`*[_id == "teamsPage"][0]{levels[]{_key, cta}}`)
  for (const level of teamsPage?.levels ?? []) {
    if (level.cta?.href) tx.patch('teamsPage', (patch) => patch.unset([`levels[_key=="${level._key}"].cta.href`]))
  }

  // Volunteer locations become two-language text
  const frLocations = {'Various locations across Canada': 'Divers endroits au Canada', Remote: 'À distance'}
  const volunteers = await client.fetch(`*[_type == "volunteerOpportunity" && defined(location) && location._type != "localeString"]{_id, location}`)
  for (const {_id, location} of volunteers) {
    if (typeof location !== 'string') continue
    tx.patch(_id, (patch) => patch.set({location: str(location, frLocations[location] ?? location)}))
  }

  const result = await tx.commit()
  console.log(`cleanup: ${result.results.length} mutations committed`)
}

if (step === 'add') await add()
else if (step === 'cleanup') await cleanup()
else throw new Error('Pass "add" or "cleanup" as the last argument')
