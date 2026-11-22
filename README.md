# Your portfolio site

Plain HTML, CSS and JavaScript. No builder, no subscription, no host lock-in.

## Edit your content
Everything you write lives in **js/content.js**: your name, statement, projects, writing, CV and the room on the landing page.
Put files in:
- `assets/img`: images (.jpg, .webp or .png; export at about 2400px wide, under 1 MB each)
- `assets/films`: short films (.mp4, H.264, under about 50 MB; host longer ones on Vimeo and use an `embed` block)
- `assets/models`: 3D models (.glb, ideally under 20 MB)

## Preview on your computer
Double-clicking index.html won't show the 3D model because browsers block it from local files. Instead:
- **Mac:** open Terminal in this folder and run `python3 -m http.server`, then visit http://localhost:8000
- **Windows:** install the free "Live Server" extension in VS Code, right-click index.html and choose "Open with Live Server"

## Place links on your room scan
Open the site with `?setup` after the address (for example `http://localhost:8000/?setup`), then click on something in the scan.
A line of code is copied for you. Paste it into the `hotspots` list in content.js and change the label and link.

## Publish free with Netlify (easiest, about 5 minutes)
1. Go to https://app.netlify.com/drop and make a free account.
2. Drag this whole folder onto the page. It's live in seconds at a `something.netlify.app` address.
3. In Site configuration, choose Change site name to get `yourname.netlify.app`.
4. To update: open your site in Netlify, go to Deploys, and drag the folder in again.
5. Own domain (optional, about £10 a year from Namecheap, Porkbun or similar): Domain management, then Add a domain, and follow the steps.

## Or publish with GitHub Pages
1. Make a free GitHub account and a new **public** repository called `yourusername.github.io`.
2. Choose "uploading an existing file" and drag in everything from this folder (files over 25 MB need GitHub Desktop; files over 100 MB aren't allowed).
3. Commit. After a minute or two the site is live at `https://yourusername.github.io`.
