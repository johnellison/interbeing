import { ProjectsApi } from '@getgreenspark/projects';

async function testAPI() {
  const projectsApi = new ProjectsApi({
    basePath: "https://sandbox.getgreenspark.com",
    apiKey: process.env.GREENSPARK_API_KEY || ''
  });

  try {
    const response = await projectsApi.getProjects();
    console.log('Raw response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));
    
    const projects = response?.data || response;
    console.log('Projects type:', typeof projects);
    console.log('Projects length:', Array.isArray(projects) ? projects.length : 'Not an array');
    
    if (Array.isArray(projects) && projects.length > 0) {
      console.log('\nFirst project structure:');
      console.log(JSON.stringify(projects[0], null, 2));
      
      console.log('\nImage-related fields in first 3 projects:');
      projects.slice(0, 3).forEach((project, index) => {
        console.log(`Project ${index + 1}:`, project.name || project.title || 'Unnamed');
        console.log('  - All keys:', Object.keys(project));
        console.log('  - imageUrl:', project.imageUrl || 'not found');
        console.log('  - thumbnailUrl:', project.thumbnailUrl || 'not found');
        console.log('  - image:', project.image || 'not found');
        console.log('  - banner:', project.banner || 'not found');
        console.log('');
      });
    } else {
      console.log('Projects is not a proper array:', projects);
    }
  } catch (error) {
    console.error('API Error:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
  }
}

testAPI();