# Surplus Soil Information Sheet

This project is a simple web application designed to collect and manage information about surplus soil consignments. The form allows users to:

- Provide site information, including address and history.
- Draw and upload a plan of proposed works using Excalidraw.
- Describe multiple consignments, including material description, expected delivery details, and sampling information.
- Add and manage analytical data for various contaminants.
- Attach relevant documents and images.
- Compose and preview an email with the form data and attachments before sending.

## Key Features

- **Dynamic Consignment Management**: Add or remove consignments dynamically.
- **Excalidraw Integration**: Draw and export plans directly within the form.
- **Email Functionality**: Compose, preview, and send emails with form data and attachments.
- **File Upload**: Drag and drop file upload for additional documents and images.

## Technology Stack

- **React**: For building the user interface.
- **Next.js**: For server-side rendering and API routes.
- **Tailwind CSS**: For styling the components.
- **Excalidraw**: For drawing and exporting plans.
- **React Dropzone**: For file upload functionality.
- **TypeScript**: For type safety and better developer experience.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/surplus-soil-information-sheet.git
   cd surplus-soil-information-sheet
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Vercel

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Sign up for a [Vercel](https://vercel.com) account if you don't have one.
3. Import your project from your Git repository.
4. Follow the prompts to deploy your application.

### Netlify

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Sign up for a [Netlify](https://www.netlify.com) account if you don't have one.
3. Create a new site from Git and select your repository.
4. Follow the prompts to deploy your application.

### Docker

1. Build the Docker image:
   ```bash
   docker build -t surplus-soil-information-sheet .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 surplus-soil-information-sheet
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
