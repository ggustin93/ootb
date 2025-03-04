# 🎓 Out of the Books Website

A collaborative platform dedicated to educational innovation in French-speaking Belgium, built with Astro and Tailwind CSS.

## 🌟 About

Out of the Books ASBL (non-profit organization) brings together teachers, experts, and education enthusiasts to transform education in French-speaking Belgium. Our mission is to build bridges between all education stakeholders and promote pedagogical innovation.

### Key Features

- ✅ Fully responsive design optimized for all devices
- ✅ Built with Astro 5.0 and Tailwind CSS
- ✅ Dark mode support
- ✅ SEO-friendly with Open Graph tags
- ✅ High performance and accessibility scores
- ✅ Image optimization using Astro Assets

## 🚀 Main Sections

- **About Us**: Our vision, mission, and values
- **Team**: Meet our dedicated team members
- **Events**: Upcoming educational events and workshops
- **Resources**: Educational tools and materials
- **Blog**: Latest news and pedagogical insights

## 💻 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **CMS**: [Tina CMS](https://tina.io/) for content management
- **Deployment & Hosting**: [Netlify](https://netlify.com)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)
- **Media Storage**: Cloudinary integration via Tina CMS
- **Version Control**: GitHub with automated deployments

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

## 🔧 Environment Variables Configuration

To ensure all features work correctly, you need to configure the following environment variables:

### Brevo API (Newsletter)

To connect the newsletter form to Brevo:

```bash
# Brevo API key for newsletter subscriptions
BREVO_API_KEY=your_brevo_api_key
```

#### How to obtain a Brevo API key
1. Log in to your Brevo account
2. Go to SMTP & API > API Keys > Generate a new API key
3. Copy the generated key

#### Configuration on Netlify
1. Go to Netlify dashboard > Site > Settings > Environment variables
2. Add a variable named `BREVO_API_KEY` with your Brevo API key

> **Important note**: With this configuration, you do **NOT** need n8n. The integrated API sends data directly to Brevo.

### n8n Variables (OPTIONAL)

n8n is a workflow automation tool that supports HTTP requests and can be used as an intermediary for form processing. While the direct Brevo API integration is simpler and recommended, you may choose to use n8n for more complex automation workflows:

```bash
# n8n webhook URL for forms
PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
```

#### Configuration on Netlify
1. Go to Netlify dashboard > Site > Settings > Environment variables
2. Add a variable named `PUBLIC_N8N_WEBHOOK_URL` with your n8n webhook URL

### Local Development Variables

For local development, create a `.env` file at the project root with the necessary variables:

```bash
# Brevo API key (recommended)
BREVO_API_KEY=your_brevo_api_key

# n8n webhook URL (optional - not recommended)
PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
```

**Important**: Make sure the `.env` file is included in your `.gitignore` to avoid exposing your API keys.

## 🙏 Credits

This website was developed by [Guillaume Gustin](https://pwablo.be) using **AstroWind** as a starting template. While AstroWind provided the initial foundation, the website has been extensively customized and rebuilt to meet Out of the Books' specific needs, including custom components, unique design elements, and specialized features for educational content management.

### About AstroWind

AstroWind is a free and open-source template originally created by [onWidget](https://onwidget.com) and maintained by a community of [contributors](https://github.com/onwidget/astrowind/graphs/contributors). It was the most starred & forked Astro theme in 2022 & 2023.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.
