/* ==========================================================================
   YOUR CONTENT LIVES HERE
   Edit the text below and add your files to the assets folder.
   You don't need to touch any other file.

   Images:  assets/img/<project-slug>/cover.jpg, 01.jpg, 02.jpg …  (.png, .jpeg and .webp work too)
            (any missing image shows a grey box with the exact file name it expects)
   Films:   assets/films/*.mp4  (or a Vimeo/YouTube link in an "embed" block)
   Models:  assets/models/*.glb
   ========================================================================== */

window.SITE = {
  name: "Polina Parshyna",
  initials: "PP",
  role: "Architectural designer",
  statement:
    "I work across digital and physical media, creating conceptual spaces around an experience.",
  availability: "Open to Part 1 architectural assistant roles",
  location: "London",
  email: "polina.parshyna14@gmail.com",
  cv: "",   // e.g. "assets/cv.pdf" once you add your CV
  links: [
    { label: "Instagram", url: "https://www.instagram.com/prawliner/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/polinaparshyna/" },
  ],
  portrait: "assets/img/portrait.jpg",
  about: [
    "I'm Polina Parshyna, an architectural designer trained at the Bartlett School of Architecture, UCL.",
    "My projects start from how people perceive and remember space. I build that into architecture through code, film and making by hand: TouchDesigner and projection, machine learning in Grasshopper, kiln-formed glass, oil pastel on tracing paper.",
  ],
  experience: [
    { years: "2023 to 2026", what: "BSc Architecture", where: "The Bartlett School of Architecture, UCL" },
    { years: "Year 3", what: "Unit 14", where: "" },
    { years: "Year 2", what: "Unit 21", where: "" },
  ],
  skills: "Rhino, Grasshopper, Blender, TouchDesigner, Python, Enscape, projection mapping, LiDAR scanning, glass slumping, model-making, hand drawing",

  /* THE ROOM on the landing page.
     model:  your scan as a .glb (a stand-in model for now)
     video:  optional fly-through .mp4. If set, it plays first and "Enter the room" switches to the 3D model.
     poster: optional still image shown while things load
     background: match this to your video's background colour so the edges disappear
     hotspots: clickable labels on things in the room. To get the numbers, open your site with
               ?setup at the end of the address (e.g. yoursite.com/?setup) and click on the scan.
               link can be a project slug (#shelter-for-memories) or #about, #writing, #contact */
  room: {
    // Your LiDAR scan as a cut-away dollhouse, with the sharpened objects (made by Claude from your .glb and photos)
    scene: "assets/models/room.glb",
    fov: 35,
    // Camera stops. The first one is where the page opens. Add your own: open the site with ?setup,
    // move the camera where you like, click anything, and copy the "scene" line it gives you.
    scenes: [
      { label: "My space", position: [3.79, 3.97, 5.00], target: [0.00, -0.50, 0.15] },
      { label: "Atmosphere", position: [1.00, 0.55, -1.60], target: [-1.00, 0.20, 1.25] },
      { label: "Designing with light", position: [0.60, 0.00, 0.80], target: [-0.60, -0.60, -1.40] },
      { label: "Material experimentation", position: [0.20, -0.25, -1.05], target: [-0.33, -0.72, -2.12] },
      { label: "Projects", position: [0.80, -0.15, 0.75], target: [-0.35, -1.05, -0.50] },
      { label: "Life drawing and painting", position: [0.30, 0.25, -1.15], target: [2.20, 0.15, -1.25] },
    ],
    // Film shown instead if a phone or browser can't run the 3D room (or it takes longer than 15 seconds to load)
    fallbackVideo: { src: "assets/films/room-flythrough.mp4", small: "assets/films/room-flythrough-small.mp4", poster: "assets/films/room-flythrough-poster.jpg" },
    // Older options, used only when there's no scene file:
    points: "",
    dark: false,
    model: "",
    video: "",
    poster: "",
    background: "",
    cameraOrbit: "35deg 68deg auto",
    hotspots: [
      { label: "Set design", link: "#set-design", position: "-1.05 0.70 1.30" },
      { label: "Shelter for memories", link: "#shelter-for-memories", position: "-0.92 -1.06 -0.17" },
      { label: "Shelter for memories: the projection", link: "#shelter-for-memories", position: "-1.30 0.30 -2.26" },
      { label: "Framing light", link: "#framing-light", position: "-0.33 -0.52 -2.07" },
      { label: "Nasproti", link: "#nasproti-opposite", position: "-0.15 -0.70 -2.00" },
      { label: "All work", link: "#work", position: "-0.65 -1.12 -0.80" },
      { label: "About me", link: "#about", position: "0.14 -0.83 -0.03" },
    ],
  },
};

/* --------------------------------------------------------------------------
   PROJECTS
   group: projects with the same group are listed together in the menu and filters
   size on the home grid: "full", "large" or "small"
   Block types:
     { type: "text",  body: "A paragraph." }
     { type: "heading", body: "A short subheading" }
     { type: "image", src: "…", caption: "…", wide: true }
     { type: "pair",  images: ["…", "…"], caption: "…" }
     { type: "video", src: "assets/films/x.mp4", poster: "…", caption: "…" }
     { type: "embed", src: "https://player.vimeo.com/video/123456", caption: "…" }
     { type: "model", src: "assets/models/x.glb", caption: "…" }
   -------------------------------------------------------------------------- */
const img = (slug, n) => `assets/img/${slug}/${n}.jpg`;

window.PROJECTS = [
  {
    slug: "shelter-for-memories",
    group: "Bartlett projects",
    title: "Shelter for memories",
    year: "2026",
    place: "London",
    kind: "Methodology development, BSc Year 3, UG14",
    size: "full",
    cover: img("shelter-for-memories", "cover"),
    summary:
      "An interactive device that projects memories into the room you live in now: a personal study of perception, nostalgia and reality after moving to a new country.",
    facts: { Unit: "UG14, The Bartlett", Tools: "TouchDesigner, Python, YOLO, projection mapping, Blender, LiDAR" },
    blocks: [
      { type: "text", body: "The project began with an analysis of Tarkovsky's The Mirror and grew into a personal investigation of perception, nostalgia and reality. It became an interactive device, built with TouchDesigner, Python and projection mapping, that expresses the nostalgia of moving to a new country. Chiaroscuro was the guiding principle throughout." },
      { type: "image", src: img("shelter-for-memories", "01"), caption: "Concept sketch: triggers - memories", wide: true },
      { type: "pair", images: [img("shelter-for-memories", "02"), img("shelter-for-memories", "03")], caption: "TouchDesigner script fragment, trigger recognition with YOLO. Broadcasting to a projector." },
      { type: "text", body: "I LiDAR-scanned my rented London flat and storyboarded how each room would hold a memory, then drew the space as a rendered plan and section." },
      { type: "heading", body: "Application" },
      { type: "text", body: "A virtual space, visualised in Blender, that layers my perception of the present with memories of the past." },
      { type: "embed", src: "https://www-ccv.adobe.io/v1/player/ccv/Uj5zz4him64/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View", caption: "Film" },
      { type: "heading", body: "Fireplace" },
      { type: "text", body: "A film study inspired by The Mirror. It uses indirect symbolism to show moving between countries, and the liminal space between reality and memory." },
      { type: "image", src: img("shelter-for-memories", "04"), caption: "Familiar fleeting moment of peace. Morning light in the bedroom", wide: true },
      { type: "image", src: img("shelter-for-memories", "05"), caption: "Childhood bedroom, projected memory" },
      { type: "pair", images: [img("shelter-for-memories", "06"), img("shelter-for-memories", "07")], caption: "Corridor. A moment of transition. Reminding of a train journey to cross the border" },
      { type: "image", src: img("shelter-for-memories", "08"), caption: "Sounds of the lively evening street." },
      { type: "image", src: img("shelter-for-memories", "09"), caption: "If I peek outside the window, will I see familiar faces? Where are they now", wide: true },
    ],
  },
  {
    slug: "subjective-landscapes",
    group: "Bartlett projects",
    title: "Subjective landscapes",
    year: "2024",
    place: "London",
    kind: "Methodology development, Unit 21",
    size: "small",
    cover: img("subjective-landscapes", "cover"),
    summary:
      "Where architectural design meets machine learning: a speech-recognition model turns people's emotional experience of the city into data, and the data into geometry.",
    facts: { Unit: "Unit 21, The Bartlett", Tools: "Python, RAVDESS dataset, Grasshopper, Rhino, Enscape" },
    blocks: [
      { type: "text", body: "Unit 21 works across many media at once. This project explores disconnection in the city through the emotional experience of individual people." },
      { type: "text", body: "An AI model trained on the open-source RAVDESS dataset analysed recorded speech and pulled out emotional data along a timeline. A custom Grasshopper and Rhino workflow then translated that data into form." },
      { type: "image", src: img("subjective-landscapes", "01"), caption: "Process drawing, semantic data in space", wide: true },
      { type: "image", src: img("subjective-landscapes", "02"), caption: "Form iterations, creating street furniture" },
      { type: "image", src: img("subjective-landscapes", "03"), caption: "Enscape rendered visualisation", wide: true },
      { type: "text", body: "How each of us experiences the city depends on who we are. Studying the biological and psychological perception of urban space is a first step towards expressing and interpreting that experience." },
    ],
  },
  {
    slug: "berlin-project",
    group: "Bartlett projects",
    title: "The Cycle: Berlin",
    year: "2025",
    place: "Sebastianstraße, Mitte, Berlin",
    kind: "Design project, Unit 21",
    size: "large",
    cover: img("berlin-project", "cover"),
    summary:
      "A launderette on a former no-man's land in Mitte, bringing Berliners of different generations together over washing clothes.",
    facts: { Programme: "Launderette and café", Tools: "Python, Grasshopper (Physarealm), Rhino" },
    blocks: [
      { type: "text", body: "The project applies the tool I developed in Subjective landscapes to a real site: a launderette that brings Berliners of different generations together through an everyday ritual." },
      { type: "embed", src: "https://www-ccv.adobe.io/v1/player/ccv/DZSzQH6eq6C/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View", caption: "Applying generated forms on site" },
      { type: "text", body: "Forms were grown with Physarealm, a Grasshopper plug-in that mimics slime-mould growth, seeded with points from the speech-emotion model. Their angular geometry echoes the indirect, geometric language of Berlin's Holocaust memorial." },
      { type: "image", src: img("berlin-project", "01"), caption: "Main area. Laundry and coffee", wide: true },
      { type: "embed", src: "https://www-ccv.adobe.io/v1/player/ccv/HCYr6x-tBLB/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View", caption: "Film" },
      { type: "heading", body: "Site" },
      { type: "text", body: "Sebastianstraße 2–5 is an underused green space in a residential neighbourhood. From 1961 to 1989 it lay between the inner and outer Berlin Wall, close to Heinrich-Heine-Straße, one of the busiest East–West crossings." },
      { type: "image", src: img("berlin-project", "02"), caption: "Site location" },
      { type: "heading", body: "Methodology" },
      { type: "text", body: "A Python to Grasshopper to Rhino workflow. Unfolded diagrams in Rhino Layouts plan for prefabrication, and Grasshopper scripts resolve the beam frames, wall details and connections at difficult angles." },
      { type: "image", src: img("berlin-project", "03"), caption: "Floor plans", wide: true },
      { type: "image", src: img("berlin-project", "04"), caption: "Sections", wide: true },
      { type: "image", src: img("berlin-project", "05"), caption: "Final render", wide: true },
      { type: "image", src: img("berlin-project", "06"), caption: "Summer open terrace with bespoke seating generated from Berliners' speech", wide: true },
    ],
  },
  {
    slug: "nasproti-opposite",
    group: "Bartlett projects",
    title: "Nasproti (Opposite)",
    year: "2026",
    place: "Ljubljana",
    kind: "Design project, BSc Year 3, UG14",
    size: "large",
    cover: img("nasproti-opposite", "cover"),
    summary:
      "A restaurant and urban aquaponic farm opposite Plečnik's Ribarnica fish market, on a UNESCO-protected site in Ljubljana.",
    facts: { Unit: "UG14, The Bartlett", Programme: "Restaurant and aquaponic farm", Brief: "Third Eye" },
    blocks: [
      { type: "text", body: "Answering the Third Eye brief, the project blends Jože Plečnik's architectural language with contemporary design. Urban farming is both the programme and the environmental strategy, so guests see their food go from farm to table. The building protects key views and respects the historic fabric of the site." },
      { type: "image", src: img("nasproti-opposite", "01"), caption: "Ground-floor plan, main dining area", wide: true },
      { type: "image", src: img("nasproti-opposite", "02"), caption: "Two-point perspective section", wide: true },
      { type: "image", src: img("nasproti-opposite", "03"), caption: "View from the Ljubljanica river", wide: true },
      { type: "pair", images: [img("nasproti-opposite", "04"), img("nasproti-opposite", "05")], caption: "Grilled octopus with asparagus. Cocktails and dancing with a view." },
      { type: "text", body: "Iterations moved between analogue and digital, 2D and 3D, blending Ljubljana's modernist architecture with the organic forms of marine life and the urban farm." },
      { type: "image", src: img("nasproti-opposite", "06"), caption: "Mixed-media collage: early interior renders and oil pastel sketches on tracing paper", wide: true },
      { type: "image", src: img("nasproti-opposite", "07"), caption: "1:50 concept model contrasting rigid and organic forms, with roof tests" },
      { type: "pair", images: [img("nasproti-opposite", "08"), img("nasproti-opposite", "09")], caption: "Blender studies of fragmented façade iterations" },
    ],
  },
  {
    slug: "framing-light",
    group: "Bartlett projects",
    title: "Framing light",
    year: "2026",
    place: "",
    kind: "Technical investigation, BSc Year 3, UG14",
    size: "small",
    cover: img("framing-light", "cover"),
    summary:
      "Low-temperature glass forming for an energy-efficient façade, where glass is both an environmental filter and a way of shaping how a space feels.",
    facts: { Unit: "UG14, The Bartlett", Tools: "Kiln slumping, plaster moulds, TouchDesigner, Grasshopper, Blender" },
    blocks: [
      { type: "text", body: "The project studies how forming glass at low temperatures can produce a façade that is both energy-efficient and visually expressive. It looks at the links between how the material is processed, how much energy that takes, and how the glass performs optically." },
      { type: "text", body: "Lower firing ranges, combined with simple surface treatments that can be scaled up, give repeatable results while cutting energy use. The proposed façade pairs material efficiency with shifting light." },
      { type: "image", src: img("framing-light", "01"), caption: "Watercolor paper study model, adjacency iteration" },
      { type: "image", src: img("framing-light", "02"), caption: "Custom plaster+syndicate moulds" },
      { type: "pair", images: [img("framing-light", "03"), img("framing-light", "04")], caption: "Glass tiles before kiln slumping over the moulds. Ready tiles after slumping" },
      { type: "text", body: "An interactive TouchDesigner script generates ripple patterns for the tiles. The more ripple sources, the more complex the interference, and the denser the geometry on each panel. Shifting that density changes how transparent the space is, separating public and private zones in a restaurant without adding any material." },
      { type: "text", body: "First tests explored how the panels could be assembled into a façade. I deliberately left structural research aside to focus on working the glass. Façade iterations used Grasshopper arrangements driven by solar gain, Blender visualisations and physical concept models." },
      { type: "image", src: img("framing-light", "05"), caption: "Fragment of a facade with tiles, experimental structure that integrates water movement", wide: true },
    ],
  },
  {
    slug: "khnumtefnut",
    group: "Bartlett projects",
    title: "Khnum & Tefnut",
    year: "2023",
    place: "",
    kind: "Installation, group project",
    size: "full",
    cover: img("khnumtefnut", "cover"),
    summary:
      "A sculptural exploration of the relationship between two Egyptian deities, expressed through the metaphor of a water cycle.",
    facts: { Type: "Installation, group project" },
    blocks: [
      { type: "text", body: "Water moves from gentle rain to a flowing river to a rising storm, then completes its cycle and leaves gifts for the people nearby. The upper section catches and reflects light like the rippled surface of a river; the middle echoes the soft rhythm of falling rain." },
      { type: "image", src: img("khnumtefnut", "01"), caption: "", wide: true },
      { type: "pair", images: [img("khnumtefnut", "02"), img("khnumtefnut", "03")], caption: "" },
      { type: "text", body: "The form hangs above its viewers as a warning: the storm is coming." },
    ],
  },
  {
    slug: "fine-art",
    group: "Personal interest",
    title: "Fine Art",
    year: "",
    place: "",
    kind: "Personal work",
    size: "large",
    cover: img("fine-art", "cover"),
    summary: "Drawings and paintings made alongside my architectural work.",
    facts: {},
    blocks: [
      { type: "image", src: img("fine-art", "01"), caption: "", wide: true },
      { type: "pair", images: [img("fine-art", "02"), img("fine-art", "03")], caption: "" },
      { type: "image", src: img("fine-art", "04"), caption: "", wide: true },
      { type: "pair", images: [img("fine-art", "05"), img("fine-art", "06")], caption: "" },
    ],
  },
  {
    slug: "set-design",
    group: "Personal interest",
    title: "Set Design",
    year: "",
    place: "",
    kind: "Short film: Boogeymen",
    size: "small",
    cover: img("set-design", "cover"),
    summary: "Set design for Boogeymen, a short film about addiction in a domestic setting.",
    facts: { Role: "Set designer", Film: "Boogeymen" },
    blocks: [
      { type: "text", body: "The set builds a dark, unsettling atmosphere that supports the film's emotional tone, aiming for nuance rather than sensationalism." },
      { type: "image", src: img("set-design", "01"), caption: "", wide: true },
      { type: "pair", images: [img("set-design", "02"), img("set-design", "03")], caption: "" },
      { type: "image", src: img("set-design", "04"), caption: "", wide: true },
    ],
  },
];

/* --------------------------------------------------------------------------
   WRITING (the section stays hidden until you add something)
   Example:
   { slug: "on-thresholds", title: "On thresholds", year: "2025", where: "Dissertation extract",
     summary: "One or two sentences.", body: ["First paragraph.", "Second paragraph."] }
   Or link elsewhere: { …, url: "https://…" }
   -------------------------------------------------------------------------- */
window.WRITING = [];
