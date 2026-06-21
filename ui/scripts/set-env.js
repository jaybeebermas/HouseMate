const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/environments/environment.production.ts');

const apiUrl = process.env.API_URL || 'https://housemate-zxbr.onrender.com';
const graphqlUrl = process.env.GRAPHQL_URL || `${apiUrl}/graphql`;

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  graphqlUrl: '${graphqlUrl}'
};
`;

fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`Production environment file generated at ${targetPath}`);
