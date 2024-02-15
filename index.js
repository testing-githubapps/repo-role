const axios = require('axios');
const fs = require('fs');

const headers = {
  'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
  'Content-Type': 'application/json'
};

const getOrganizationIdQuery = `
  query($login: String!) {
    organization(login: $login) {
      id
    }
  }
`;

const getTeamIdQuery = `
  query($org: String!, $slug: String!) {
    organization(login: $org) {
      team(slug: $slug) {
        id
      }
    }
  }
`;

const assignRoleToTeamQuery = `
  mutation grantMigratorRole($organizationId: ID!, $actor: String!, $actor_type: ActorType!) {
    grantMigratorRole( input: { organizationId: $organizationId, actor: $actor, actorType: $actor_type}) {
      success 
    }
  }
`;

const teamInfo = JSON.parse(fs.readFileSync('team.json', 'utf8'));

const getOrganizationIdVariables = {
  login: teamInfo.organization
};

let organizationId = '';

axios.post('https://api.github.com/graphql', {
  query: getOrganizationIdQuery,
  variables: getOrganizationIdVariables
}, { headers: headers })
.then(response => {
  console.log(`Organization ID: ${response.data.data.organization.id}`);
  organizationId = response.data.data.organization.id;
})
.catch(error => {
  console.log(`Error: ${error.message}`);
});

const getTeamIdVariables = {
  org: teamInfo.organization,
  slug: teamInfo.slug
};

axios.post('https://api.github.com/graphql', {
  query: getTeamIdQuery,
  variables: getTeamIdVariables
}, { headers: headers })
.then(response => {
  const teamId = response.data.data.organization.team.id;
  console.log(`Team ID: ${teamId}`);
  const assignRoleToTeamVariables = {
    organizationId: organizationId,
    actor: teamInfo.actor,
    actor_type: teamInfo.actor_type
  };

  return axios.post('https://api.github.com/graphql', {
    query: assignRoleToTeamQuery,
    variables: assignRoleToTeamVariables
  }, { headers: headers });
})
.then(response => {
  console.log(`Assigned role to: ${teamInfo.actor}.`);
})
.catch(error => {
  console.log(`Error: ${error.message}`);
});