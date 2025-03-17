# 🎓 Out of the Books Website

A collaborative platform for educational innovation in French-speaking Belgium, built with **Astro** and **Tailwind CSS**.

## 🌟 About

**Out of the Books ASBL** is a non-profit bringing together teachers, experts, and education enthusiasts to foster pedagogical innovation. Our mission is to connect all education stakeholders and transform learning experiences.

## 🚀 Features

- 📱 Fully responsive & optimized for all devices
- 🎨 Dark mode support
- ⚡ Built with **Astro 5.0** & **Tailwind CSS**
- 🔍 SEO-ready with Open Graph support
- 🏆 High performance & accessibility scores
- 🖼️ Image optimization via **Astro Assets**

## 📂 Main Sections

- **About Us**: Vision, mission & values
- **Team**: Meet the members
- **Events**: Educational workshops & conferences
- **Resources**: Pedagogical tools & materials
- **Blog**: Insights & latest updates

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **CMS**: [Tina CMS](https://tina.io/)
- **Deployment**: [Netlify](https://netlify.com)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)
- **Media Storage**: Cloudinary via Tina CMS

## 🏗️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Ensure the following variables are configured for full functionality:

```bash
# Token d'API NocoDB pour la récupération des données des stands
NOCODB_API_TOKEN

# Tina CMS 
TINA_SEARCH_TOKEN
TINA_CLIENT_ID
TINA_TOKEN

# Cloudinary
CLOUDINARY_CLOUD_NAM
CLOUDINARY_API_KEY

# Youtube
YOUTUBE_PLAYLIST_ID

# Brevo
BREVO_API_KEY
BREVO_LIST_ID
```

To set them up on **Netlify**:
1. Go to Netlify dashboard > Site > Settings > Environment variables
2. Add the variables with corresponding values

## 📦 Data Handling

The project fetches and processes educational content efficiently using pre-build data generation:

1. **Static Data Generation**:
   - Fetches data from NocoDB (events, workshops, resources)
   - Optimizes images for performance
   - Stores data in JSON format for fast access
2. **Pre-Build Optimization**:
   - Eliminates runtime API calls
   - Ensures consistent performance

```bash
# Generate event data
npm run build:events

# Fetch latest content
npm run fetch:events
```

## 🙏 Credits

Developed by [Guillaume Gustin](https://pwablo.be) using a customized version of **AstroWind** by [onWidget](https://onwidget.com).

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE.md) file for details.

